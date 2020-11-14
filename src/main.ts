import * as core from '@actions/core'
import { SwiftEnvironmentFixer } from './environment_fixer'
import { SwiftToolInstaller } from './installer'

// Inputs

const url: string = core.getInput('url')
const branch: string = core.getInput('branch')
const version: string = core.getInput('version')
const useCache: boolean = core.getInput('use-cache') == 'true'

// Run

async function main(): Promise<void> {
	await SwiftToolInstaller.install(url, branch, version, useCache)
	await SwiftEnvironmentFixer.fixAll()
}

main().catch(error => {
	core.setFailed(error.message)
})
