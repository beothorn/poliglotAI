import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default {
  input: 'index.mjs',
  output: {
    file: 'bundle.js',
    format: 'iife', // Immediately Invoked Function Expression
    name: 'App',    // Global variable name in the browser
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
  ],
};
