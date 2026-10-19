module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  testTimeout: 25000,
  forceExit: true,
  verbose: true,
};
