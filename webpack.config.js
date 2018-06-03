const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/Adversatile.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "adversatile.js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      handlebars: 'handlebars/dist/handlebars.min.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
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
