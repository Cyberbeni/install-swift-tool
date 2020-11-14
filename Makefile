.PHONY: build
build:
	yarn
	npm run format
	npm run build
	npm run package

.PHONY: test-local
test-local:
	yarn
	npm run build
	npm test

.PHONY: once-mac
once-mac:
	brew reinstall npm
	brew reinstall yarn
