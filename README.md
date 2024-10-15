## Description

Github action to install swift based tools, like `xcbeautify` or `swiftformat`, to be used inside workflows.

## Versions

`master` - It should always work and contain the latest changes.

`v1` - Initial version. Deprecated, use `v2` with `use-cache: false` instead.

`v2` - Adds caching (enabled by default), allows specifying `commit` or `version`. Deprecated, use `v3`, set branch manually if you want to use the default branch and set `LINUX_SOURCEKIT_LIB_PATH` manually if needed (not needed with the official runner images for more than 2 years).

`v3` - Uses the `Package.resolved` file if no commit/branch/version is specified.

## Usage

Step example:
```yaml
- name: Install xcbeautify
  uses: Cyberbeni/install-swift-tool@v3
  with:
    url: https://github.com/nicklockwood/SwiftFormat
    # Version from Package.resolved is used if no commit/branch/version is provided.
    commit: '175df295d77b5bf255b0c160d380cabbe826ded4' # optional, commit hash
    branch: develop # optional, branch or tag, overridden by commit/version
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
      uses: actions/checkout@v4
    - name: Install SwiftFormat
      uses: Cyberbeni/install-swift-tool@v3
      with:
        url: https://github.com/nicklockwood/SwiftFormat
    - name: Lint
      run: swiftformat --lint .
```

## How to contribute

Install Node.js: https://nodejs.org/en/download/package-manager

Enable corepack (if you get an error, it needs to be run as administrator)
```bash
corepack enable
```

Download the dependencies
```bash
yarn
```

Run before commit (fix any issues manually that formatting can't automatically fix)
```bash
npm run format
npm run build
```

Run unit tests in `./tests` (the e2e tests are run on GitHub after push/pull request)
```bash
npm run test
```
