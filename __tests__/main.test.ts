import * as h from '../src/helpers'

// const url = 'https://github.com/realm/SwiftLint'

test('Local test', async() => {
  const options = await h.supportedBuildOptions(['--disable-sandbox', '--disable-automatic-resolution', '--disable-index-store', '--disable-package-manifest-caching', '--disable-prefetching'])
  console.log(options)
  expect(options.length).toBe(5)
})
