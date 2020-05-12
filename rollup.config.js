import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import {terser} from 'rollup-plugin-terser';

export default [
	// CommonJS
	{
		inlineDynamicImports: true,
		input: './src/index.ts',
		output: [
			{
				file: pkg.main,
				format: 'cjs'
			}
		],
		external: [
			...Object.keys(pkg.dependencies || {})
		],
		plugins: [
			babel({
				exclude: 'node_modules/**'
			}),
			typescript({
				typescript: require('typescript')
			}),
			terser() // minifies generated bundles
		]
	}
];