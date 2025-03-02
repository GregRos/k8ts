import path from "path";

/** @type {import("jest").Config} */
const config = {
    testEnvironment: "node",
    testPathIgnorePatterns: ["dist"],
    transform: {
        "^.+\\.tsx?$": ["@swc/jest"]
    },
    rootDir: ".",
    testMatch: ["<rootDir>/test/**/*.test.ts"],
    // Should be set via --coverage option
    collectCoverage: false,
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
    coverageDirectory: "<rootDir>/coverage",
    moduleNameMapper: {
        "^@lib/(.*)$": "<rootDir>/src/$1",
        "^@lib$": "<rootDir>/src"
    },

    globals: {
        defaults: {}
    }
};

export default config;
