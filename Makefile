.PHONY: build
build:
	npm install
	npm run build
	ncc build -o dist ./lib/main.js

.PHONY: test-local
test-local:
	npm install
	npm run build
	npm test

.PHONY: once-mac
once-mac:
	brew reinstall npm
	brew reinstall yarn
	yarn
	npm i -g @vercel/ncc
