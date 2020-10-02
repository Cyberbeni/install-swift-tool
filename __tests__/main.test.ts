import * as semver from 'semver'
import { better_exec } from '../src/helpers'

test('Get versions', async() => {
    let versionsString = await better_exec('git', ['ls-remote', '--refs', '--tags', 'https://github.com/realm/SwiftLint'])
    let versions = versionsString.split('\n').map(function(value, index, array) {
        return value.split('/').pop() ?? ''
    })
    let targetVersion = semver.maxSatisfying(versions, '^0')
    console.log(versions)
    console.log(targetVersion)
});