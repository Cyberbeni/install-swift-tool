import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as cache from '@actions/cache';
import * as os from 'os'
import uuidv4 from 'uuid/v4';

const url: string = core.getInput('url');
const branch: string = core.getInput('branch');
const saveToCache: boolean = core.getInput('save-to-cache') == 'true';
const restoreFromCache: boolean = core.getInput('restore-from-cache') == 'true';

const homeDirectory = os.homedir();
const uuid: string = uuidv4();
const workingDirectory = `${homeDirectory}/install-swift-tool-${uuid}`;
const productDirectory = `${workingDirectory}/.build/release`;

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

async function create_working_directory(): Promise<void> {
  await core.group('Create working directory...', async () => {
    await exec.exec('mkdir', ['-p', workingDirectory]);
  })
}

let didRestore: boolean = false;
let commitHash: string = '';
async function try_to_restore(): Promise<void> {
  await core.group('Try to restore from cache...', async () => {
    if (branch) {
      commitHash = await better_exec('git', ['ls-remote', '-ht', url, `refs/heads/${branch}`, `refs/tags/${branch}`]);
    } else {
      commitHash = await better_exec('git', ['ls-remote', url, `HEAD`]);
    }
    commitHash = commitHash.substring(0,39);
  })
}

async function clone_git(): Promise<void> {
  await core.group('Clone repo...', async () => {
    if (branch) {
      await exec.exec('git', ['clone', '--depth', '1', '--branch', branch, url, workingDirectory]);
    } else {
      await exec.exec('git', ['clone', '--depth', '1', url, workingDirectory]);
    }
    await exec.exec('git', ['rev-parse', 'HEAD']);
  })
}

async function build_tool(): Promise<void> {
  await core.group('Build tool...', async () => {
    await exec.exec('swift', ['build', '--package-path', workingDirectory, '--configuration', 'release', '--disable-sandbox']);
  })
}

async function export_path(): Promise<void> {
  await core.group('Export path...', async () => {
    core.addPath(productDirectory);
  })
}

async function main(): Promise<void> {
  await create_working_directory();
  if (restoreFromCache) {
    try_to_restore()
  }
  if (!didRestore) {
    await clone_git();
    await build_tool();
  }
  await export_path();
}

main().catch(error => { core.setFailed(error.message); })
