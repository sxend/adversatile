import typescript from "rollup-plugin-typescript2";
import builtins from "rollup-plugin-node-builtins";
import {uglify} from "rollup-plugin-uglify";
import preprocess from "rollup-plugin-preprocess";
import commonjs from 'rollup-plugin-commonjs';
import license from 'rollup-plugin-license';
import deepmerge from "deepmerge";
import * as fs from "fs";

export default {
  input: 'src/Adversatile.ts',
  output: {
    file: 'dist/adversatile.js',
    format: 'iife',
    name: "__adv__",
    intro: [ // inject Promise polyfill rollup-plugin-inject notwork in typescript.
      "var Promise = (function() {",
      fs.readFileSync(require.resolve('es6-promise')).toString(),
      "return this;",
      "}).call({}).ES6Promise;",
    ].join("\n")
  },
  plugins: [
    preprocess({
      include: ['**/*.ts'],
      context: (() => {
        let context = {
          API_URL: "",
          JSON_FETCH_PATH: "",
          JSONP_FETCH_PATH: "",
          VIDEO_PLAYER_SCRIPT_URI: "",
          VIDEO_PLAYER_OBJECT_NAME: "",
        };
        try {
          context = deepmerge(context, require("./.advrc.json"));
        } catch (e) {
          console.error(e);
        }
        return context;
      })()
    }),
    builtins(),
    commonjs({
      namedExports: {
        'node_modules/deepmerge/index.js': [ 'deepmerge' ]
      }
    }),
    typescript({
      tsconfig: "tsconfig.json"
    }),
    uglify(),
    license({
      banner: [
        'See OSS Licenses',
        'https://raw.githubusercontent.com/Gozala/events/master/LICENSE',
        'https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE',
        'https://raw.githubusercontent.com/KyleAMathews/deepmerge/master/license.txt',
        'https://raw.githubusercontent.com/trix/nano/master/MIT-LICENSE'
      ].join('\n')
    })
  ]
};