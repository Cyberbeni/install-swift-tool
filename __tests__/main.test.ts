import * as semver from 'semver'

import { exec } from '../src/helpers'

const url = 'https://github.com/realm/SwiftLint'

test('Get versions', async() => {
  let versionsString = await exec('git', ['ls-remote', '--refs', '--tags', url])
  let versions = versionsString.split('\n').map(function(value) {
    return value.split('/').pop() ?? ''
  })
  let targetVersion = semver.maxSatisfying(versions, '^0')
  console.log(versions)
  console.log(targetVersion)
})

test('Get commit hash', async() => {
  let resp = await exec('git', ['ls-remote', url, `HEAD`])
  let commitHash = resp.substring(0,40)
  console.log(resp)
  console.log(commitHash)
})
