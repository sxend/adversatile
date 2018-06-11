import inject from 'rollup-plugin-inject';
import RollupPluginPreprocess from 'rollup-plugin-preprocess';
import typescript from 'rollup-plugin-typescript2';
import builtins from 'rollup-plugin-node-builtins';
import { uglify } from 'rollup-plugin-uglify';
const deepmerge = require("deepmerge");
const context = (function() {
  let context = {
    API_URL: "",
    JSON_FETCH_PATH: "",
    JSONP_FETCH_PATH: "",
    VIDEO_PLAYER_SCRIPT_URI: "",
    VIDEO_PLAYER_OBJECT_NAME: "",
  };
  try {
    context = deepmerge(context, require("./.advrc.json"));
  } catch (e) {}
  return context;
})();

export default {
  input: './src/Adversatile.ts',
  output: {
    file: './dist/adversatile.js',
    format: 'iife',
    name: "__ADV__"
  },
  plugins: [
    RollupPluginPreprocess({
      include: '**/*.ts',
      context: context
    }),
    builtins(),
    typescript({
      tsconfig: "tsconfig.json"
    }),
    inject({
      include: '**/*.ts',
      exclude: 'node_modules/**',
      // Promise: [ 'es6-promise', 'Promise' ],
      deepmerge: "deepmerge/dist/es"
    }),
    uglify()
  ]
};
