import { SwiftToolInstaller } from '../src/installer'

test('Test Package.resolved v3 parsing', async() => {
	const installer = new SwiftToolInstaller('https://github.com/nicklockwood/SwiftFormat', '', '' , '', false)
	const version = installer.parsePackageResolved()
	expect(version).toBe('ab6844edb79a7b88dc6320e6cee0a0db7674dac3')
})
