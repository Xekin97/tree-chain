import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import strip from "@rollup/plugin-strip";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import externals from "rollup-plugin-node-externals";

import pkg from "./package.json" assert { type: "json" };

const defaultOutput = {
	name: pkg.name,
	exports: "named",
	preserveModules: true,
	preserveModulesRoot: "src",
};

const defaultPlugins = [
	externals({
		devDeps: false,
	}),
	resolve(),
	commonjs(),
	json(),
	strip(),
	terser(),
];

export default [
	// for commonjs
	{
		input: "./src/index.ts",
		output: [
			{
				dir: pkg.common,
				format: "cjs",
				...defaultOutput,
			},
		],
		plugins: [
			typescript({
				outDir: pkg.common,
			}),
			...defaultPlugins,
		],
	},
	{
		input: "./src/index.ts",
		output: [
			{
				dir: pkg.module,
				format: "es",
				...defaultOutput,
			},
		],
		plugins: [
			typescript({
				outDir: pkg.module,
			}),
			...defaultPlugins,
		],
	},
];
