import globals from "globals"
import js from "@eslint/js"
import ts from "typescript-eslint"

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	{
		files: ["src/**/*.ts"],
		ignores: ["**/vendor/**/*.ts"],
		languageOptions: {
			parser: ts.parser,
			parserOptions: {
				sourceType: "script",
				project: "tsconfig.json"
			},
			globals: {
				...globals.node
			}
		},
		plugins: {
			ts: ts.plugin
		},
		rules: {
			"max-len": ["warn", { "code": 140 }],
			"indent": ["warn", "tab"],
			"quotes": ["warn", "single"],
			"semi": ["warn", "never"],
			"ts/no-floating-promises": ["error", { "ignoreVoid": true }]
		}
	}
]
