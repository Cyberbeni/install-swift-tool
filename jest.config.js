module.exports = {
	clearMocks: true,
	verbose: true,
	moduleFileExtensions: ['js', 'ts'],
	testEnvironment: 'node',
	testMatch: ['<rootDir>/tests/**'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
}
