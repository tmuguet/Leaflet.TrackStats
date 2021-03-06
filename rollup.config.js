import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const input = 'src/index.js';
const external = ['leaflet', '@mapbox/corslite', 'geoportal-access-lib', 'promise-queue'];
const globals = {
  leaflet: 'L', '@mapbox/corslite': 'corslite', 'geoportal-access-lib': 'Gp', 'promise-queue': 'Queue',
};
const sourcemap = true;

export default [
  // browser-friendly UMD build
  {
    input,
    output: {
      name: 'leaflet_trackstats',
      file: pkg.browser,
      format: 'umd',
      sourcemap,
      globals,
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'runtime',
      }),
      terser(),
    ],
    external,
  },
  {
    input,
    output: {
      name: 'leaflet_trackstats_uncompressed',
      file: pkg.browser_uncompressed,
      format: 'umd',
      sourcemap,
      globals,
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: ['node_modules/**'],
        babelHelpers: 'runtime',
      }),
    ],
    external,
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input,
    external: ['ms', /@babel\/runtime/] + external,
    output: [
      {
        file: pkg.main, format: 'cjs', sourcemap, globals,
      },
      {
        file: pkg.module, format: 'es', sourcemap, globals,
      },
    ],
    plugins: [],
  },
];
