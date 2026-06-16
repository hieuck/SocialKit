module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
    '^@socialkit/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@socialkit/automation$': '<rootDir>/../../packages/automation/src/index.ts',
    '^@socialkit/analyzer$': '<rootDir>/../../packages/analyzer/src/index.ts',
    '^@socialkit/cli$': '<rootDir>/../../packages/cli/src/index.ts',
    '^@socialkit/provider-facebook$': '<rootDir>/../../packages/providers/facebook/src/index.ts',
    '^@socialkit/provider-instagram$': '<rootDir>/../../packages/providers/instagram/src/index.ts',
    '^@socialkit/provider-zalo$': '<rootDir>/../../packages/providers/zalo/src/index.ts',
    '^@socialkit/testing$': '<rootDir>/../../packages/testing/src/index.ts'
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
