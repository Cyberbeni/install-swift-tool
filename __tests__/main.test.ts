import * as exec from '@actions/exec'
import * as semver from 'semver'

async function better_exec(commandLine: string, args?: string[]): Promise<string> {
    let output: string = ''
    await exec.exec(commandLine, args, {
      listeners: {
        stdout: (data: Buffer) => { output += data.toString().trim() }
      }
    })
    return output
  }

test('Get versions', async() => {
    let versionsString = await better_exec('git', ['ls-remote', '--refs', '--tags', 'https://github.com/realm/SwiftLint'])
    let versions = versionsString.split('\n').map(function(value, index, array) {
        return value.split('/').pop() ?? ''
    })
    let targetVersion = semver.maxSatisfying(versions, '^0')
    console.log(versions)
    console.log(targetVersion)
});