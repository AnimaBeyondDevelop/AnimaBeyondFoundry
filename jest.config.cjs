module.exports = {
  transform: {},
  testEnvironment: 'node',
  testRegex: '.*\\.(test|spec)\\.js$',
  setupFiles: ['<rootDir>/jest.setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/dist/']
};
