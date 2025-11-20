import * as core from '@actions/core'
import { getExecOutput } from '@actions/exec'
import * as os from 'os'
import * as crypto from 'crypto'

export async function exec(commandLine: string, args: string[]): Promise<string> {
	const { stdout } = await getExecOutput(commandLine, args)
	return stdout.trim()
}

export async function getUuid(url: string, commitHash: string): Promise<string> {
	let additionalInfo: string
	if (os.platform() == 'darwin') {
		additionalInfo = `macos-${os.arch()}`
	} else {
		const osVersion = await exec('uname', ['-v'])
		const swiftVersion = await exec('swift', ['-version'])
		additionalInfo = `${osVersion}-${os.arch()}-${swiftVersion}`
	}
	return crypto.createHash('sha1')
		.update(`${url}-${commitHash}-${additionalInfo}`)
		.digest('hex')
}

export function errorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	} else if (error instanceof String) {
		return error.valueOf()
	} else if (typeof error === 'string') {
		return error
	} else {
		return `Unexpected error type: '${typeof error}'`
	}
}

export function logError(error: unknown): void {
	core.info(errorMessage(error))
}
