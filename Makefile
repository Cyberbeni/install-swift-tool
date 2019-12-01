.PHONY: build
build:
	npm install
	npm run build
	npm prune --production

.PHONY: test-local
test-local:
	npm install
	npm run build
	npm test

.PHONY: once-mac
once-mac:
	brew install npm
	brew install yarn
	yarn
