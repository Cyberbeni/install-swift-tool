## Description

Github action to install swift based tools, like `xcbeautify` or `swiftformat`, to be used inside workflows.

## Versions

`master` - It should always work and contain the latest changes.

`v1` - Initial version. Deprecated, use `v2` with `use-cache: false` instead.

`v2` - Adds caching (enabled by default), allows specifying `commit` or `version`.

`v3` (unreleased) - Uses the `Package.resolved` file if no commit/branch/version is specified.

## Usage

Step example:
```yaml
- name: Install xcbeautify
  uses: Cyberbeni/install-swift-tool@v2
  with:
    url: https://github.com/Cyberbeni/xcbeautify
    commit: '40fa00f879ec5823a7362cbb8ca0cd06abafde61' # optional, commit hash
    branch: linux-fixes # optional, branch or tag, overridden by commit/version
    version: '*' # optional, overridden by commit, format: https://devhints.io/semver
    use-cache: true # optinal, default: true
```

Workflow example:
```yaml
name: Lint

on: 
  pull_request:
  push:
    branches: master # https://docs.github.com/en/free-pro-team@latest/actions/guides/caching-dependencies-to-speed-up-workflows#restrictions-for-accessing-a-cache

jobs:
  swiftformat-lint:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: Install SwiftFormat
      uses: Cyberbeni/install-swift-tool@v2
      with:
        url: https://github.com/nicklockwood/SwiftFormat
        version: '*' # https://devhints.io/semver
    - name: Lint
      run: swiftformat --lint .
```

GitHub Action example:
```tsx
import { SwiftToolInstaller } from 'install-swift-tool'

await SwiftToolInstaller.install(url, commit, branch, version, useCache)
```

## How to contribute

Install npm and yarn on macOS (Homebrew required)
```bash
make once-mac
```

Run before commit
```bash
make
```

Run tests in `./__test__/` (for testing parts of the logic, the real tests are run on GitHub after push/pull request)
```bash
make test
```
