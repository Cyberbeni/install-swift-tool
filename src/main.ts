import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as os from 'os'
import uuidv5 from 'uuid/v5';
import { isUndefined } from 'util';

const url: string = core.getInput('url');
const branch: string = core.getInput('branch');
const useCache: boolean = core.getInput('use-cache') == 'true';

const homeDirectory = os.homedir();

/** vvv HELPERS vvv */

async function better_exec(commandLine: string, args?: string[]): Promise<string> {
  let output: string = ''
  await exec.exec(commandLine, args, {
    listeners: {
      stdout: (data: Buffer) => { output = data.toString().trim() }
    }
  })
  return output
}

/** ^^^ HELPERS ^^^ */

let uuid: string = '';
let swiftVersion = '';
let workingDirectory = '';
let productDirectory = '';
let commitHash: string = '';
async function create_working_directory(): Promise<void> {
  await core.group('Create working directory...', async () => {
    if (branch) {
      commitHash = await better_exec('git', ['ls-remote', '-ht', url, `refs/heads/${branch}`, `refs/tags/${branch}`]);
    } else {
      commitHash = await better_exec('git', ['ls-remote', url, `HEAD`]);
    }
    commitHash = commitHash.substring(0,39);
    swiftVersion = await better_exec('swift', ['-version']);

    uuid = uuidv5(`${url}-${commitHash}-${swiftVersion}`, '6050636b-7499-41d4-b9c6-756aff9856d0');
    workingDirectory = `${homeDirectory}/install-swift-tool-${uuid}`;
    productDirectory = `${workingDirectory}/.build/release`;

    await exec.exec('mkdir', ['-p', workingDirectory]);
  })
}

let didRestore: boolean = false;
async function try_to_restore(): Promise<void> {
  await core.group('Try to restore from cache...', async () => {
    didRestore = !isUndefined(await cache.restoreCache([productDirectory], `installswifttool-${uuid}`))
    core.setOutput('cache-hit', `${didRestore}`)
  })
}

async function clone_git(): Promise<void> {
  await core.group('Clone repo...', async () => {
    if (branch) {
      await exec.exec('git', ['clone', '--depth', '1', '--branch', branch, url, workingDirectory]);
    } else {
      await exec.exec('git', ['clone', '--depth', '1', url, workingDirectory]);
    }
    await exec.exec('git', ['-C', workingDirectory,'rev-parse', 'HEAD']);
  })
}

async function build_tool(): Promise<void> {
  await core.group('Build tool...', async () => {
    await exec.exec('swift', ['build', '--package-path', workingDirectory, '--configuration', 'release', '--disable-sandbox']);
  })
}

async function save_to_cache(): Promise<void> {
  await core.group('Save to cache...', async () => {
    await cache.saveCache([productDirectory], `installswifttool-${uuid}`)
  })
}

async function export_path(): Promise<void> {
  await core.group('Export path...', async () => {
    core.addPath(productDirectory);
  })
}

async function main(): Promise<void> {
  await create_working_directory();
  if (useCache) {
    await try_to_restore()
  }
  if (!didRestore) {
    await clone_git();
    await build_tool();
    if (useCache) {
      await save_to_cache()
    }
  }
  await export_path();
}

main().catch(error => { core.setFailed(error.message); })
