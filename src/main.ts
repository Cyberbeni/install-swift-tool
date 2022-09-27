import * as core from '@actions/core'
import { SwiftEnvironmentFixer } from './environment_fixer'
import { SwiftToolInstaller } from './installer'

async function main(): Promise<void> {
	// Inputs
	const url: string = core.getInput('url', { required: true })
	const commit: string = core.getInput('commit')
	const branch: string = core.getInput('branch')
	const version: string = core.getInput('version')
	const useCache: boolean = core.getInput('use-cache') == 'true'

	// Run
	await SwiftToolInstaller.install(url, commit, branch, version, useCache)
	await SwiftEnvironmentFixer.fixAll()
}

main().catch(error => {
	core.setFailed(error.message)
})
