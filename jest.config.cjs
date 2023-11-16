/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/test/unit/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverage: false,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["lcov", "text-summary"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
};
