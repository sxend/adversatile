const path = require("path");
const webpack = require("webpack");
const deepmerge = require("deepmerge");

module.exports = {
  entry: "./src/Adversatile.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "adversatile.js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      handlebars: "handlebars/dist/handlebars.min.js"
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          "ts-loader",
          {
            loader: "preprocess-loader",
            options: (function() {
              let context = {
                API_URL: "",
                JSON_FETCH_PATH: "",
                JSONP_FETCH_PATH: ""
              };
              try {
                context = deepmerge(context, require("./.advrc.json"));
              } catch (e) {}
              return context;
            })()
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      Promise: "es6-promise"
    })
  ]
};
