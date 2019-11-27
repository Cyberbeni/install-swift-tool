import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as os from 'os'
import * as uuid from "uuid/v1";

const url: string = core.getInput('url');
const branch: string = core.getInput('branch');

const homeDirectory = os.homedir();
const workingDirectory = `${homeDirectory}/action-install-swift-tool-${uuid()}`;
const productDirectory = `${workingDirectory}/.build/release`;

async function create_working_directory(): Promise<void> {
  await group('Create working directory...', async () => {
    await exec.exec('mkdir', ['-p', workingDirectory]);
  })
}

async function clone_git(): Promise<void> {
  await group('Clone repo...', async () => {
    if (branch) {
      await exec.exec('git', ['clone', '--depth', '1', '--branch', branch, url, workingDirectory]);
    } else {
      await exec.exec('git', ['clone', '--depth', '1', url, workingDirectory]);
    }
  })
}

async function build_tool(): Promise<void> {
  await group('Build tool...', async () => {
    await exec.exec('cd', [workingDirectory])
    await exec.exec('swift', ['build', '--configuration', 'release', '--disable-sandbox']);
  })
}

async function main(): Promise<void> {
  await create_working_directory();
  await clone_git();
  await build_tool();
  core.addPath(productDirectory);
}

main().catch(error => { core.setFailed(error.message); })
