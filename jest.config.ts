import type { Config } from 'jest'

import packageJson from './package.json'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/build/', '/node_modules/', '/__tests__/', 'tests'],
  coverageDirectory: '<rootDir>/coverage/',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  displayName: packageJson.name,
  setupFilesAfterEnv: ['./tests/setup.ts'],
  testTimeout: 120000,
}

export default config
