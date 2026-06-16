module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
    '^@socialkit/core$': '<rootDir>/../core/src/index.ts',
    '^@socialkit/testing$': '<rootDir>/../testing/src/index.ts'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json'
      }
    ]
  }
}
