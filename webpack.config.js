// Generated using webpack-cli https://github.com/webpack/webpack-cli

import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const isProduction = process.env.NODE_ENV === 'production';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(dirname, 'dist'),
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'asset/inline',
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        type: 'asset/resource',
      },
      // {
      //   test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      //   use: 'url-loader?limit=10000',
      // },
      // {
      //   test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
      //   use: 'file-loader',
      // },
    ],
  },
};

export default () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }

  return config;
};
