#!/bin/false
# shellcheck disable=SC1008

# Don't call this script directly.
# Usage from other scripts:

# set -eo pipefail
# pushd "$(dirname "${BASH_SOURCE[0]}")/.." > /dev/null
# SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
#
# DOCKER_IMAGE="docker.io/swift:6.2.0"
# PROCESS="swift" # can be an empty string if always have to be run inside container
#
# do_it() {
# 	echo "add script here"
# }
#
# source scripts/_script-wrapper.sh

if [[ -n "$RUNNING_IN_CONTAINER" ]] || which "$PROCESS" > /dev/null 2>&1; then
	do_it "$@"
elif which docker > /dev/null 2>&1; then
	docker run --rm \
		--volume .:/workspace \
		--user "$(id -u):$(id -g)" \
		--env RUNNING_IN_CONTAINER=true \
		"$DOCKER_IMAGE" \
		"/workspace/scripts/$SCRIPT_NAME" "$@"
elif which podman > /dev/null 2>&1; then
	podman run --rm \
		--volume .:/workspace \
		--userns=keep-id \
		--env RUNNING_IN_CONTAINER=true \
		"$DOCKER_IMAGE" \
		"/workspace/scripts/$SCRIPT_NAME" "$@"
elif which container > /dev/null 2>&1; then
	container system start
	container run --rm \
		--volume "$PWD":/workspace \
		--env RUNNING_IN_CONTAINER=true \
		"$DOCKER_IMAGE" \
		"/workspace/scripts/$SCRIPT_NAME" "$@"
else
	if [[ -n "$PROCESS" ]]; then
		echo "Either '$PROCESS', 'docker', 'podman' or 'container' has to be installed to run this script."
	else
		echo "Either 'docker', 'podman' or 'container' has to be installed to run this script."
	fi
	exit 1
fi
