import globals from "globals"
import js from "@eslint/js"
import ts from "typescript-eslint"

export default ts.config({
	files: [
		"src/**/*.ts",
		"__tests__/**/*.ts",
	],
	ignores: ["src/vendor/**"],
	extends: [
		js.configs.recommended,
		...ts.configs.recommended,
	],
	languageOptions: {
		parser: ts.parser,
		parserOptions: {
			sourceType: "script",
			project: true,
			tsconfigRootDir: "."
		},
		globals: {
			...globals.node
		}
	},
	rules: {
		"max-len": ["warn", { "code": 140 }],
		"indent": ["warn", "tab"],
		"quotes": ["warn", "single"],
		"semi": ["warn", "never"],
		"@typescript-eslint/no-floating-promises": ["error", { "ignoreVoid": true }]
	}
})
