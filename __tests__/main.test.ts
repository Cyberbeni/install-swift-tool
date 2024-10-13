import { SwiftToolInstaller } from '../src/installer'

test('Test Package.resolved v3 parsing', async() => {
  const installer = new SwiftToolInstaller("https://github.com/nicklockwood/SwiftFormat", "", "" , "", false)
  const version = installer.parsePackageResolved()
  expect(version).toBe("0.54.5")
})
