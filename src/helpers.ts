import * as exec from '@actions/exec'

export async function better_exec(commandLine: string, args?: string[]): Promise<string> {
  let output: string = ''
  await exec.exec(commandLine, args, {
    listeners: {
      stdout: (data: Buffer) => { output += data.toString().trim() }
    }
  })
  return output
}
