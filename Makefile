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
 
 .PHONY: clean
 clean:
	rm -f tsconfig.tsbuildinfo
	rm -rf dist

.PHONY: git-status
git-status:
	@[ "$$(git status --porcelain)" = "" ] || ( echo "\033[0;31mError:\033[0m Working directory is dirty."; exit 1 )
