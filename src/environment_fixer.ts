import * as core from '@actions/core'
import * as os from 'os'
import { env } from 'process'

export class SwiftEnvironmentFixer {
  static async fixSourceKitPath () {
    const envVar='LINUX_SOURCEKIT_LIB_PATH'
    if(env[envVar] != undefined) {
      return
    }
    await core.group(`Setting ${envVar}`, async () => {
      core.exportVariable(envVar, '/usr/share/swift/usr/lib')
    })
  }

  static async fixAll() {
    if (os.platform() == 'linux') {
      await this.fixSourceKitPath()
    }
  }
}