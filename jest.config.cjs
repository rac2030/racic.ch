/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/jest.globalSetup.cjs',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/content/**',
    '!src/pages/**',
    '!src/layouts/**',
    '!src/components/**',
    '!src/styles/**',
    '!src/data/**',
    '!src/content.config.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = config;
