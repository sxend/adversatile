const path = require("path");

module.exports = {
  entry: "./src/Adversatile.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "adversatile.js"
  }
};
