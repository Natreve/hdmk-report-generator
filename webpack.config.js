// import { resolve, join } from "path";
const path = require("path");
const Dotenv = require("dotenv-webpack");
module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "public/js"),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 8000,
  },
  plugins: [new Dotenv()],
  resolve: {
    fallback: {
      path: require.resolve("path-browserify"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      http: require.resolve("stream-http"),
      fs: false,
    },
    alias: {
      handlebars: "handlebars/runtime.js",
    },
  },
  module: {
    rules: [
      {
        test: /\.hbs$/,
        use: [
          {
            loader: "handlebars-loader",
            options: {
              helperDirs: path.join(__dirname, "src/helpers"),
              precompileOptions: {
                knownHelpersOnly: false,
              },
            },
          },
        ],
      },
    ],
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
