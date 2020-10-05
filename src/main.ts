import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as os from 'os'
import * as semver from 'semver'

import { exec, getUuid } from './helpers'

// Inputs

const url: string = core.getInput('url')
let branch: string = core.getInput('branch')
const version: string = core.getInput('version')
const useCache: boolean = core.getInput('use-cache') == 'true'

// Steps

async function resolve_version(): Promise<void> {
  await core.group('Resolving version requirement', async () => {
    let versions = (await exec('git', ['ls-remote', '--refs', '--tags', url]))
      .split('\n')
      .map(function(value) {
        return value.split('/').pop() ?? ''
      })
    let targetVersion = semver.maxSatisfying(versions, version)
    if (targetVersion) {
      core.info(`Resolved version: ${targetVersion}`)
      branch = targetVersion
    } else {
      throw Error(`No version satisfying '${version}' found.`)
    }
  })
}

const homeDirectory = os.homedir()
let uuid: string = ''
let workingDirectory = ''
let productDirectory = ''
let cacheDirectory = ''
function updateDirectoryNames() {
  workingDirectory = `${homeDirectory}/install-swift-tool-${uuid}`
  productDirectory = `${workingDirectory}/.build/release`
  cacheDirectory = `${workingDirectory}/.build/*/release`
}
async function create_working_directory(): Promise<void> {
  await core.group('Creating working directory', async () => {
    let commitHash: string = ''
    if (branch) {
      commitHash = await exec('git', ['ls-remote', '-ht', url, `refs/heads/${branch}`, `refs/tags/${branch}`])
    } else {
      commitHash = await exec('git', ['ls-remote', url, `HEAD`])
    }
    commitHash = commitHash.substring(0,40)

    uuid = await getUuid(url, commitHash)
    updateDirectoryNames()

    await exec('mkdir', ['-p', workingDirectory])
  })
}

let cacheKey: string = ''
let didRestore: boolean = false
async function try_to_restore(): Promise<void> {
  await core.group('Trying to restore from cache', async () => {
    cacheKey = `installswifttool-${uuid}`
    didRestore = await cache.restoreCache([cacheDirectory, productDirectory], cacheKey) !== undefined
    core.setOutput('cache-hit', `${didRestore}`)
  })
}

async function clone_git(): Promise<void> {
  await core.group('Cloning repo', async () => {
    if (branch) {
      await exec('git', ['clone', '--depth', '1', '--branch', branch, url, workingDirectory])
    } else {
      await exec('git', ['clone', '--depth', '1', url, workingDirectory])
    }
    const commitHash = await exec('git', ['-C', workingDirectory,'rev-parse', 'HEAD'])
    const newUuid = await getUuid(url, commitHash)
    if (uuid != newUuid) {
      const oldWorkingDirectory = workingDirectory
      updateDirectoryNames()
      await exec('mv', [oldWorkingDirectory, workingDirectory])
    }
  })
}

async function build_tool(): Promise<void> {
  await core.group('Building tool', async () => {
    await exec('swift', ['build', '--package-path', workingDirectory, '--configuration', 'release', '--disable-sandbox'])
  })
}

async function try_to_cache(): Promise<void> {
  await core.group('Trying to save to cache', async () => {
    try {
      await cache.saveCache([cacheDirectory, productDirectory], cacheKey)
    } catch (error) {
      core.info(error.message)
    }
  })
}

async function export_path(): Promise<void> {
  await core.group('Exporting path', async () => {
    core.addPath(productDirectory)
  })
}

async function main(): Promise<void> {
  if (version) {
    await resolve_version()
  }
  await create_working_directory()
  if (useCache) {
    await try_to_restore()
  }
  if (!didRestore) {
    await clone_git()
    await build_tool()
    if (useCache) {
      await try_to_cache()
    }
  }
  await export_path()
}

main().catch(error => { core.setFailed(error.message); })
