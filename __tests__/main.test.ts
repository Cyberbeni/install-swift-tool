import * as os from 'os'
import * as semver from 'semver'

import { exec } from '../src/helpers'

// const url = 'https://github.com/realm/SwiftLint'

test('Local test', async() => {
  const swiftVersion = await exec('swift', ['-version'])
  let additionalInfo = `${os.version()}-${swiftVersion}`
  if (os.platform() == "darwin") {
    let macVersion = await exec('sw_vers', ['-productVersion'])
    if (semver.gte(macVersion, "10.14.4")) {
      additionalInfo = `macos-${os.arch()}`
    }
  }
  console.log(additionalInfo)
})
