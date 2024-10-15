import * as h from '../src/helpers'

describe('exec', () => {
	test('throw error when non-zero exit code', async () => {
		await expect(h.exec('this-command-doesnt-exits', [])).rejects.toThrow()
	})
	test('return output when zero exit code', async () => {
		expect(await h.exec('git', ['--version'])).toMatch(/^git version /)
	})
})
