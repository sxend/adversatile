import typescript from "rollup-plugin-typescript2";
import builtins from "rollup-plugin-node-builtins";
import {uglify} from "rollup-plugin-uglify";
import preprocess from "rollup-plugin-preprocess";
import deepmerge from "deepmerge";

export default {
  input: 'src/Adversatile.ts',
  output: {
    file: 'dist/adversatile.js',
    format: 'iife',
    name: "__adv__"
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
    typescript(),
    uglify()
  ]
};