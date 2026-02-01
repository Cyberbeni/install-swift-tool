import { describe, test } from 'node:test'
import assert from 'node:assert/strict';
import * as h from '../src/helpers'

describe('exec', () => {
	test('throw error when the command doesn\'t exist', async () => {
		await assert.rejects(h.exec('this-command-doesnt-exist', []))
	})
	test('throw error when non-zero exit code', async () => {
		await assert.rejects(h.exec('git', ['this-subcommand-doesnt-exist']))
	})
	test('return output when zero exit code', async () => {
		assert.match(await h.exec('git', ['--version']), /^git version /)
	})
})
