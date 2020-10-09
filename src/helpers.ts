import * as core from '@actions/core'
import { exec as _exec } from '@actions/exec'
import * as os from 'os'
import * as semver from 'semver'
import { v5 as _uuid } from 'uuid'

export async function exec(commandLine: string, args?: string[]): Promise<string> {
  let output: string = ''
  await _exec(commandLine, args, {
    listeners: {
      stdout: (data: Buffer) => { output += data.toString().trim() }
    }
  })
  return output
}

export async function getUuid(url: string, commitHash: string): Promise<string> {
  const swiftVersion = await exec('swift', ['-version'])
  let additionalInfo = `${os.version}-${swiftVersion}`
  core.info(additionalInfo)
  if (os.platform() == "darwin") {
    let macVersion = await exec('sw_vers', ['-productVersion'])
    if (semver.gte(macVersion, "10.14.4")) {
      additionalInfo = `macos-${os.arch}`
    }
  }
  return _uuid(`${url}-${commitHash}-${additionalInfo}`, '6050636b-7499-41d4-b9c6-756aff9856d0')
}
