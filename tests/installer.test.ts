import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

import { SwiftToolInstaller } from '../src/installer.ts'

describe('Version resolving', () => {
	const testCases = [
		'2',
		'2.4',
		'2.4.1',
		'<3',
		'v2',
		'^2',
		'~2',
		'^2.3',
		'~2.4',
		'~2.4.0',
		'2.x',
	]
	for (const version of testCases) {
		test(version, async () => {
			const installer = new SwiftToolInstaller(
				'https://github.com/Cyberbeni/install-swift-tool', '', '', version, false, 'tests/Package.resolved',
			)
			await installer.resolveVersion()
			assert.equal(installer.branch, 'v2.4.1')
		})
	}
})

describe('Package.resolved v3 parsing', () => {
	test('success', async () => {
		const installer = new SwiftToolInstaller('https://github.com/nicklockwood/SwiftFormat', '', '', '', false, 'tests/Package.resolved')
		const hash = await installer.getCommitHash()
		assert.equal(hash, 'ab6844edb79a7b88dc6320e6cee0a0db7674dac3')
	})
	test('error if not found', async () => {
		const installer = new SwiftToolInstaller('https://github.com/cpisciotta/xcbeautify', '', '', '', false, 'tests/Package.resolved')
		await assert.rejects(installer.getCommitHash())
	})
})

describe('Branch/tag resolving', () => {
	const testCases = [
		'v2', // branch
		'v2.4.1', // tag
	]
	for (const branch of testCases) {
		test(branch, async () => {
			const installer = new SwiftToolInstaller(
				'https://github.com/Cyberbeni/install-swift-tool', '', branch, '', false, 'tests/Package.resolved',
			)
			const hash = await installer.getCommitHash()
			assert.equal(hash, '7c869f37ca4184c71b60034c7d81e33e1e35d051')
		})
	}
})
