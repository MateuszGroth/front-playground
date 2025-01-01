// list modules that need to be transformed from esm into cjs
const esModules = ['swiper'].join('|')

const config = {
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
  },
  verbose: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleDirectories: ['node_modules'],
  testTimeout: 1000000,
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
}

export default config
