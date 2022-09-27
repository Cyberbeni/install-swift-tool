import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as fs from 'fs'
import * as os from 'os'
import * as semver from 'semver'

import { exec, getUuid, logError } from './helpers'

export class SwiftToolInstaller {
	// Input

	readonly url: string
	commit: string
	branch: string
	readonly version: string
	readonly useCache: boolean

	private constructor(url: string, commit: string, branch: string, version: string, useCache: boolean) {
		this.url = url
		this.commit = commit
		this.branch = branch
		this.version = version
		this.useCache = useCache
	}

	// Steps

	async resolveVersion(): Promise<void> {
		await core.group('Resolving version requirement', async () => {
			const versions = (await exec('git', ['ls-remote', '--refs', '--tags', this.url])).split('\n').map(function (value) {
				return value.split('/').pop() ?? ''
			})
			const targetVersion = semver.maxSatisfying(versions, this.version)
			if (targetVersion) {
				core.info(`Resolved version: ${targetVersion}`)
				this.branch = targetVersion
			} else {
				throw Error(`No version satisfying '${this.version}' found.`)
			}
		})
	}

	uuid = ''
	cacheKey = ''
	workingDirectory = ''
	productDirectory = ''
	cacheDirectory = ''
	updateDirectoryNames(newUuid: string): void {
		this.uuid = newUuid
		this.cacheKey = `installswifttool-${this.uuid}`
		this.workingDirectory = `${os.homedir()}/install-swift-tool-${this.uuid}`
		this.productDirectory = `${this.workingDirectory}/.build/release`
		this.cacheDirectory = `${this.workingDirectory}/.build/*/release`
	}
	async createWorkingDirectory(): Promise<void> {
		await core.group('Creating working directory', async () => {
			let commitHash = ''
			if (this.commit) {
				if (this.commit.length != 40) {
					throw Error('`commit` should be 40 characters if specified.')
				}
				commitHash = this.commit
			} else if (this.branch) {
				commitHash = await exec('git', ['ls-remote', '-ht', this.url, `refs/heads/${this.branch}`, `refs/tags/${this.branch}`])
			} else {
				commitHash = await exec('git', ['ls-remote', this.url, 'HEAD'])
			}
			commitHash = commitHash.substring(0, 40)
			this.updateDirectoryNames(await getUuid(this.url, commitHash))
			await exec('mkdir', ['-p', this.workingDirectory])
		})
	}

	didRestore = false
	async tryToRestore(): Promise<void> {
		await core.group('Trying to restore from cache', async () => {
			this.didRestore = (await cache.restoreCache([this.cacheDirectory, this.productDirectory], this.cacheKey)) !== undefined
		})
	}

	async cloneGit(): Promise<void> {
		await core.group('Cloning repo', async () => {
			if (this.commit) {
				await exec('git', ['init', this.workingDirectory])
				await exec('git', ['remote', 'add', 'origin', this.url, this.workingDirectory])
				await exec('git', ['fetch', '--depth', '1', 'origin', this.commit, this.workingDirectory])
				await exec('git', ['checkout', 'FETCH_HEAD', this.workingDirectory])
			} else if (this.branch) {
				await exec('git', ['clone', '--depth', '1', '--branch', this.branch, this.url, this.workingDirectory])
			} else {
				await exec('git', ['clone', '--depth', '1', this.url, this.workingDirectory])
			}
			// `git rev-parse HEAD` gave different result than `git ls-remote -ht ...`
			// when used with an annotated tag: https://stackoverflow.com/a/15472310
			// This seems to print the same hash(es) but only if `git clone` used `--depth 1`
			const commitHash = (await exec('git', ['-C', this.workingDirectory, 'show-ref', '-s'])).split('\n').pop() ?? ''
			const newUuid = await getUuid(this.url, commitHash)
			if (this.uuid != newUuid) {
				const oldWorkingDirectory = this.workingDirectory
				this.updateDirectoryNames(newUuid)
				await exec('mv', [oldWorkingDirectory, this.workingDirectory])
			}
		})
	}

	async buildTool(): Promise<void> {
		await core.group('Building tool', async () => {
			// TODO: Research what these flags do: '--disable-index-store', '--disable-package-manifest-caching', '--disable-prefetching'
			// They didn't make any difference when building SwiftLint
			// '--disable-automatic-resolution' caused build error on Linux for realm/SwiftLint@0.40.3:
			//    'cannot update Package.resolved file because automatic resolution is disabled'
			await exec('swift', ['build', '--package-path', this.workingDirectory, '--configuration', 'release', '--disable-sandbox'])
		})
	}

	async tryToCleanupIntermediateBuildProducts(): Promise<void> {
		await core.group('Trying to delete intermediate build products', async () => {
			try {
				const contents = fs.readdirSync(this.productDirectory)
				for (const itemName of contents) {
					const itemPath = `${this.productDirectory}/${itemName}`
					try {
						if (fs.lstatSync(itemPath).isDirectory()) {
							fs.rmSync(itemPath, { recursive: true })
						} else {
							fs.accessSync(itemPath, fs.constants.X_OK)
						}
					} catch {
						fs.unlinkSync(itemPath)
					}
				}
			} catch (error) {
				logError(error)
			}
		})
	}

	async tryToCache(): Promise<void> {
		await core.group('Trying to save to cache', async () => {
			try {
				await cache.saveCache([this.cacheDirectory, this.productDirectory], this.cacheKey)
			} catch (error) {
				logError(error)
			}
		})
	}

	async exportPath(): Promise<void> {
		await core.group('Exporting path', async () => {
			core.addPath(this.productDirectory)
		})
	}

	// Run

	async install(): Promise<void> {
		if (this.version) {
			await this.resolveVersion()
		}
		await this.createWorkingDirectory()
		if (this.useCache) {
			await this.tryToRestore()
		}
		if (!this.didRestore) {
			await this.cloneGit()
			await this.buildTool()
			if (this.useCache) {
				await this.tryToCleanupIntermediateBuildProducts()
				await this.tryToCache()
			}
		}
		await this.exportPath()
	}

	static async install(url: string, commit = '', branch = '', version = '', useCache = true): Promise<void> {
		const installer = new SwiftToolInstaller(url, commit, branch, version, useCache)
		await installer.install()
	}
}
