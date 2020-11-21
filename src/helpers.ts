import { exec as _exec } from '@actions/exec'
import * as os from 'os'
import { v5 as _uuid } from 'uuid'

export async function exec(commandLine: string, args?: string[]): Promise<string> {
	let output: string = ''
	await _exec(commandLine, args, {
		listeners: {
			stdout: (data: Buffer) => {
				output += data.toString().trim()
			}
		}
	})
	return output
}

export async function getUuid(url: string, commitHash: string): Promise<string> {
	const platform = os.platform()
	let additionalInfo: string
	if (platform == 'darwin') {
		additionalInfo = `macos-${os.arch()}`
	} else {
		const swiftVersion = await exec('swift', ['-version'])
		additionalInfo = `${platform}-${os.arch()}-${swiftVersion}`
	}
	return _uuid(`${url}-${commitHash}-${additionalInfo}`, '6050636b-7499-41d4-b9c6-756aff9856d0')
}

export async function supportedBuildOptions(argsToTest: string[]): Promise<string[]> {
	const helpText = await exec('swift', ['build', '--help'])
	let validArgs: string[] = []
	for (const arg of argsToTest) {
		const regex = RegExp(`(${arg})\\s`)
		if (regex.test(helpText)) {
			validArgs.push(arg)
		}
	}
	return validArgs
}
