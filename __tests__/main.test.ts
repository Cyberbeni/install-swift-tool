import { PackageResolved } from '../src/vendor/SwiftPackage'
import fs from 'fs'

test('Test Package.resolved v3 parsing', async() => {
  const packageResolvedText = fs.readFileSync("./Package.resolved", { encoding: 'utf8' })
  const packageResolved = new PackageResolved(packageResolvedText)
  expect(packageResolved.pins[0].location).toBe("https://github.com/nicklockwood/SwiftFormat")
})
