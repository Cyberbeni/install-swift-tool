const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
	resolvePluginsRelativeTo: __dirname,
	recommendedConfig: js.configs.recommended,
});

module.exports = [
	...compat.config({
		"env": {
		  "node": true,
		  "es6": true
		},
		"extends": [
		  "eslint:recommended",
		  "plugin:@typescript-eslint/recommended"
		],
		"parser": "@typescript-eslint/parser",
		"parserOptions": {
		  "ecmaVersion": 6,
		  "sourceType": "script",
		  "project": "tsconfig.json"
		},
		"plugins": [
		  "@typescript-eslint"
		],
		"rules": {
		  "max-len": ["warn", { "code": 140 }],
		  "indent": ["warn", "tab"],
		  "quotes": ["warn", "single"],
		  "semi": ["warn", "never"],
		  "@typescript-eslint/no-floating-promises": ["error", { "ignoreVoid": true }]
		}
	})
];
