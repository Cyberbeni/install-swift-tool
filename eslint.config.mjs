import globals from "globals"
import stylistic from "@stylistic/eslint-plugin"
import js from "@eslint/js"
import ts from "typescript-eslint"

export default ts.config({
	files: [
		"src/**/*.ts",
		"tests/**/*.ts",
	],
	ignores: ["src/vendor/**"],
	extends: [
		stylistic.configs["recommended-flat"],
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
		"@stylistic/max-len": ["warn", { "code": 140 }],
		"@stylistic/indent": ["warn", "tab"],
		"@stylistic/no-tabs": "off",
		"@stylistic/quotes": ["warn", "single"],
		"@stylistic/semi": ["warn", "never"],
		"@stylistic/comma-dangle": ["warn", "always-multiline"],
		"@stylistic/brace-style": ["warn", "1tbs"],
		"@stylistic/lines-between-class-members": "off",

		"@typescript-eslint/no-floating-promises": ["error", { "ignoreVoid": true }]
	}
})
