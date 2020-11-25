import * as core from '@actions/core'
import * as fs from 'fs'
import * as os from 'os'
import { env } from 'process'

import { exec } from './helpers'

export class SwiftEnvironmentFixer {
	static async fixTar(): Promise<void> {
		await core.group(`Installing gnu-tar`, async () => {
			// https://github.com/Cyberbeni/install-swift-tool/issues/69
			// https://formulae.brew.sh/formula/gnu-tar
			// PATH="$(brew --prefix)/opt/gnu-tar/libexec/gnubin:$PATH"
			await exec('brew', ['install', 'gnu-tar'])
			const brewPrefix = await exec('brew', ['--prefix'])
			core.addPath(`${brewPrefix}/opt/gnu-tar/libexec/gnubin`)
		})
	}

	static async fixSourceKitPath(): Promise<void> {
		// https://github.com/Cyberbeni/install-swift-tool/issues/68
		const envVar = 'LINUX_SOURCEKIT_LIB_PATH'
		if (env[envVar] != undefined) {
			return
		}
		await core.group(`Setting ${envVar}`, async () => {
			let exported = false
			const libName = 'libsourcekitdInProc.so'
			const possiblePaths = ['/usr/share/swift/usr/lib', '/usr/lib']
			for (const path of possiblePaths) {
				if (fs.existsSync(`${path}/${libName}`)) {
					core.info(`Setting to: '${path}'`)
					core.exportVariable(envVar, path)
					exported = true
					break
				}
			}
			if (!exported) {
				core.warning(`Failed to find suitable path for ${envVar}`)
			}
		})
	}

	static async fixBeforeRun(): Promise<void> {
		if (os.platform() == 'darwin') {
			await this.fixTar()
		}
	}

	static async fixAfterRun(): Promise<void> {
		if (os.platform() == 'linux') {
			await this.fixSourceKitPath()
		}
	}
}
