import * as core from '@actions/core'
import * as os from 'os'
import { env } from 'process'

import { exec } from './helpers'

export class SwiftEnvironmentFixer {
  static async fixSourceKitPath () {
    const envVar='LINUX_SOURCEKIT_LIB_PATH'
    if(env[envVar] != undefined) {
      return
    }
    await core.group(`Setting ${envVar}`, async () => {
      const swiftPath = await exec('which', ['swift'])
      core.exportVariable(envVar, `${swiftPath}/../lib`)
    })
  }

  static async fixAll() {
    if (os.platform() == 'linux') {
      await this.fixSourceKitPath()
    }
  }
}