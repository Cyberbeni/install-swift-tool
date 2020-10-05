import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as os from 'os'
import * as semver from 'semver'

import { exec, getUuid } from './helpers'

export class SwiftToolInstaller {

  // Input

  readonly url: string
  branch: string
  readonly version: string
  readonly useCache: boolean

  private constructor(url: string, branch: string, version: string, useCache: boolean) {
    this.url = url
    this.branch = branch
    this.version = version
    this.useCache = useCache
  }

  // Steps

  async resolveVersion(): Promise<void> {
    await core.group('Resolving version requirement', async () => {
      let versions = (await exec('git', ['ls-remote', '--refs', '--tags', this.url]))
        .split('\n')
        .map(function(value) {
          return value.split('/').pop() ?? ''
        })
      let targetVersion = semver.maxSatisfying(versions, this.version)
      if (targetVersion) {
        core.info(`Resolved version: ${targetVersion}`)
        this.branch = targetVersion
      } else {
        throw Error(`No version satisfying '${this.version}' found.`)
      }
    })
  }

  uuid: string = ''
  cacheKey: string = ''
  workingDirectory = ''
  productDirectory = ''
  cacheDirectory = ''
  updateDirectoryNames(newUuid: string) {
    this.uuid = newUuid
    this.cacheKey = `installswifttool-${this.uuid}`
    this.workingDirectory = `${os.homedir()}/install-swift-tool-${this.uuid}`
    this.productDirectory = `${this.workingDirectory}/.build/release`
    this.cacheDirectory = `${this.workingDirectory}/.build/*/release`
  }
  async createWorkingDirectory(): Promise<void> {
    await core.group('Creating working directory', async () => {
      let commitHash: string = ''
      if (this.branch) {
        commitHash = await exec('git', ['ls-remote', '-ht', this.url, `refs/heads/${this.branch}`, `refs/tags/${this.branch}`])
      } else {
        commitHash = await exec('git', ['ls-remote', this.url, `HEAD`])
      }
      commitHash = commitHash.substring(0,40)
      this.updateDirectoryNames(await getUuid(this.url, commitHash))
      await exec('mkdir', ['-p', this.workingDirectory])
    })
  }

  didRestore: boolean = false
  async tryToRestore(): Promise<void> {
    await core.group('Trying to restore from cache', async () => {
      this.didRestore = await cache.restoreCache([this.cacheDirectory, this.productDirectory], this.cacheKey) !== undefined
    })
  }

  async cloneGit(): Promise<void> {
    await core.group('Cloning repo', async () => {
      if (this.branch) {
        await exec('git', ['clone', '--depth', '1', '--branch', this.branch, this.url, this.workingDirectory])
      } else {
        await exec('git', ['clone', '--depth', '1', this.url, this.workingDirectory])
      }
      const commitHash = await exec('git', ['-C', this.workingDirectory,'rev-parse', 'HEAD'])
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
      await exec('swift', ['build', '--package-path', this.workingDirectory, '--configuration', 'release', '--disable-sandbox'])
    })
  }

  async tryToCache(): Promise<void> {
    await core.group('Trying to save to cache', async () => {
      try {
        await cache.saveCache([this.cacheDirectory, this.productDirectory], this.cacheKey)
      } catch (error) {
        core.info(error.message)
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
        await this.tryToCache()
      }
    }
    await this.exportPath()
  }

  static async install(url: string, branch: string, version: string, useCache: boolean): Promise<void> {
    const installer = new SwiftToolInstaller(url, branch, version, useCache)
    await installer.install()
  }
}
