const path = require("path");
const Dotenv = require("dotenv-webpack");
module.exports = {
  entry: "./src/index.js",
  mode: "production",
  output: {
    path: path.resolve(__dirname, "public/js"),
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 5000,
  },
  plugins: [new Dotenv()],
};
