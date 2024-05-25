/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest",
	testMatch: ["**/*.test.{ts,tsx}"],
	transform: {
		"^.+\\.[tj]sx?$": "ts-jest",
	},
};
