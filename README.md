## Description

Github action to install swift based tools, like `xcbeautify` or `swiftformat`, to be used inside workflows.

## Versioning/Releases

`master` - It should always work and contain the latest changes.

`v1` - Initial version. Deprecated, use `v2` with `use-cache: false` instead.

`v2` - Adds caching. (Enabled by default)

## Usage:

Step example:
```yaml
- name: Install xcbeautify
  uses: Cyberbeni/install-swift-tool@v2
  with:
    url: https://github.com/Cyberbeni/xcbeautify
    branch: linux-fixes # optional
    use-cache: true # optinal, default: true
```

Workflow example:
```yaml
name: Lint

on: pull_request

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
    - name: Lint
      run: swiftformat --lint .
```

## How to contribute

Install npm and yarn on macOS (Homebrew required)
```bash
$ make once-mac
```

Run before commit
```bash
make build
```

Run tests in `./__test__/` (for testing parts of the logic, the real tests are run on GitHub after push/pull request)
```bash
make test-local
```
