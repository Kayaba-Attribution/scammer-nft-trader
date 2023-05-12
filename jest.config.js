module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist"],
  moduleNameMapper: {
    "./controllers/parseBlur.js": "<rootDir>/src/controllers/parseBlur.ts",
    "./controllers/parseLooksRare.js": "<rootDir>/src/controllers/parseLooksRare.ts",
    "./controllers/parseNftTrader.js": "<rootDir>/src/controllers/parseNftTrader.ts",
    "./controllers/parseSeaport.js": "<rootDir>/src/controllers/parseSeaport.ts",
    "./controllers/parseTransferEvent.js": "<rootDir>/src/controllers/parseTransferEvent.ts",
    "./controllers/parseTx.js": "<rootDir>/src/controllers/parseTx.ts"
  }
};
