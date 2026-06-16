module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
    '^@socialkit/core$': '<rootDir>/../../../packages/core/src/index.ts'
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
