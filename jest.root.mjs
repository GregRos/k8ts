/** @type {import("jest").Config} */
const common = {
    moduleNameMapper: {
        "^@lib/(.*)$": "<rootDir>/src/$1",
        "^@lib$": "<rootDir>/src"
    },
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: "test/tsconfig.json" }]
    },
    testEnvironment: "node",
    testMatch: ["<rootDir>/test/**/*.test.ts"],
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
    coverageDirectory: "./coverage",
    collectCoverage: false,
    testPathIgnorePatterns: ["node_modules", "dist"]
}

export default common
