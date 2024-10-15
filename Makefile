.PHONY: build
build:
	yarn
	npm run format
	npm run build

.PHONY: test
test:
	yarn
	npm run lint
	npm run test

.PHONY: once-mac
once-mac:
	brew reinstall npm
	brew reinstall yarn
