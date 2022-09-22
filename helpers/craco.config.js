const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  style: {
    css: {
      loaderOptions: (cssLoaderOptions) => {
        cssLoaderOptions.modules.exportLocalsConvention = 'camelCase'

        return cssLoaderOptions
      },
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          plugins: [new TsconfigPathsPlugin(), ...webpackConfig.resolve.plugins],
        },
      }
    },
  },
  jest: {
    configure: (jestConfig) => {
      const conf = {
        ...jestConfig,
        roots: ['<rootDir>/src'],
        setupFilesAfterEnv: ['<rootDir>/config/setupTests.ts'],
        coverageReporters: ['lcov'],
        // testPathIgnorePatterns: ['src/helpers/testRender.test.tsx'],
        moduleNameMapper: {
          // temporary solution - not needed when jest is updated to v28
          ...jestConfig.moduleNameMapper,
          ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
        },
        rootDir: './',
      }

      return conf
    },
  },
}
