import * as core from '@actions/core'
import { exec as _exec } from '@actions/exec'
import * as os from 'os'
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
  let additionalInfo: string
  if (os.platform() == "darwin") {
    additionalInfo = `macos-${os.arch()}`
  } else {
    let osVersion: string
    if (os.version != undefined) {
      osVersion = os.version()
    } else {
      core.info('os.version undefined, using `uname -v` instead')
      osVersion = await exec('uname', ['-v']) // os.version is somehow undefined on GitHub runner
    }
    const swiftVersion = await exec('swift', ['-version'])
    additionalInfo = `${osVersion}-${os.arch()}-${swiftVersion}`
  }
  return _uuid(`${url}-${commitHash}-${additionalInfo}-testing1`, '6050636b-7499-41d4-b9c6-756aff9856d0')
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
