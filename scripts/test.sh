#!/bin/bash

set -eo pipefail
pushd "$(dirname "${BASH_SOURCE[0]}")/.." > /dev/null
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

DOCKER_IMAGE="docker.io/node:lts-slim"
PROCESS="yarn"

do_it() {
	yarn install --immutable --immutable-cache --check-cache
	npm run test
}

source scripts/_script-wrapper.sh
