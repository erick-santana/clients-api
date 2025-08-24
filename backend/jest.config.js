module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/databaseInstance.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.js'
      ],
      collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/config/databaseInstance.js'
      ]
    },
    {
      displayName: 'integration',
      testMatch: [
        '<rootDir>/tests/integration/**/*.test.js'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
    }
  ]
};
