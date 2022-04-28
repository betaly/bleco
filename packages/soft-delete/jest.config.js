module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest/legacy',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testMatch: ['**/?(*.)+(spec|test|unit|integration|acceptance).[jt]s?(x)'],
  testPathIgnorePatterns: ['node_modules', 'dist'],

  coverageReporters: ['html', 'text', 'text-summary', 'cobertura'],
};
