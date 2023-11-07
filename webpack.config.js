const path = require('path');
const Dotenv = require('dotenv-webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
module.exports = {
  entry: './src/server.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new Dotenv({
        path: './.env.production'
    }),
    new NodePolyfillPlugin()
  ],
  externals: [nodeExternals()],
  target: 'node'
};