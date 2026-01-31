const core = require('./node_modules/@actions/core')
import { SwiftToolInstaller } from './installer'
import { errorMessage } from './helpers'

async function main(): Promise<void> {
	// Inputs
	const url: string = core.getInput('url', { required: true })
	const commit: string = core.getInput('commit')
	const branch: string = core.getInput('branch')
	const version: string = core.getInput('version')
	const useCache: boolean = core.getInput('use-cache') == 'true'
	const packageResolvedPath: string = core.getInput('package-resolved-path')

	// Run
	const installer = new SwiftToolInstaller(url, commit, branch, version, useCache, packageResolvedPath)
	await installer.install()
}

main().catch((error) => {
	core.setFailed(errorMessage(error))
})
