const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const json = require('eslint-plugin-json')
const js = require('@eslint/js')

const ignores = ['**/tmp/', '**/package-lock.json', '**/test/']
const rules = Object.assign(
	{
		files: ['services/**.js', '**/*.json'],
		ignores,

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'commonjs',
		},

		rules: {
			'prettier/prettier': [
				'error',
				{
					singleQuote: true,
				},
			],

			indent: 0,
			quotes: ['error', 'single'],
			semi: ['error', 'never'],
			'no-var': ['error'],
			'no-console': ['off'],
			'no-unused-vars': ['warn'],
			'no-mixed-spaces-and-tabs': ['warn'],
			'node/no-process-env': 'error',
		},
	},
	eslintPluginPrettierRecommended,
	js.configs.recommended,
	json.configs['recommended'],
)

module.exports = [rules, { ignores }]
