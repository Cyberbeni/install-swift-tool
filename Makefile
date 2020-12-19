.PHONY: build
build:
	yarn
	npm run format
	npm run build
	npm run package

.PHONY: test
test:
	yarn
	npm run lint
	npm run build
	npm test

.PHONY: once-mac
once-mac:
	brew reinstall npm
	brew reinstall yarn
 
 .PHONY: clean
 clean:
	rm -f tsconfig.tsbuildinfo
	rm -rf dist
	rm -rf lib
	rm -rf types

.PHONY: git-status
git-status:
	@status=$$(git status --porcelain)
	@[ "${status}" = "" ] || ( echo "Error: Working directory is dirty."; exit 1 )

.PHONY: publish
publish: clean build git-status
	@version=$$(git tag --points-at HEAD | tr -d 'v')
	@[ "${version}" ] || ( echo "Error: Version tag not found."; exit 1 )
	$$(sed -i '' -e 's/"version": "0.0.0",/"version": "${version}",/g' package.json)
	@echo ================================================================================
	git diff
	@echo ================================================================================
	@echo "Are you sure? [y/N] " && read ans && [ $${ans:-N} = y ]
	npm publish
