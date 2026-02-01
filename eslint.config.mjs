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
		...ts.configs.recommendedTypeChecked,
	],
	languageOptions: {
		parser: ts.parser,
		parserOptions: {
			sourceType: "script",
			project: true
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

		"@typescript-eslint/no-floating-promises": ["error", {
			"ignoreVoid": true,
			"allowForKnownSafeCalls": [
				{
					"from": "package",
					"name": [
						"describe",
						"test"
					],
					"package": "node:test"
				}
			]
		}],
		"@typescript-eslint/require-await": "off",
	}
})
