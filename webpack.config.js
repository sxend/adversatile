const path = require("path");

module.exports = {
  entry: "./src/Adversatile.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "adversatile.js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  }
};
