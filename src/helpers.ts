import { exec as _exec } from '@actions/exec'

export async function exec(commandLine: string, args?: string[]): Promise<string> {
  let output: string = ''
  await _exec(commandLine, args, {
    listeners: {
      stdout: (data: Buffer) => { output += data.toString().trim() }
    }
  })
  return output
}
