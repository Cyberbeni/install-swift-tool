import * as core from '@actions/core'
import { SwiftToolInstaller } from './installer'

// Inputs

const url: string = core.getInput('url')
const branch: string = core.getInput('branch')
const version: string = core.getInput('version')
const useCache: boolean = core.getInput('use-cache') == 'true'

// Run

async function main(): Promise<void> {
  SwiftToolInstaller.install(url, branch, version, useCache)
}

main().catch(error => { core.setFailed(error.message); })
