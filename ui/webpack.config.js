var webpack = require('webpack');
var path = require('path');
const env = process.env.NODE_ENV;
module.exports = [
  {
    entry: "./index.js",
    output: {
      path: path.resolve(__dirname, 'ESTIA/'),
      publicPath: '/',
      filename: "bundle.js"
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env)
      })
    ],
    module: {
      rules: [{
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'bundle.css',
            },
          },
          { loader: 'extract-loader' },
          { loader: 'css-loader' },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./node_modules'],
            }
          },
        ]
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
      },]
    },
    devServer: {
      historyApiFallback: true,
      host: '0.0.0.0',
      disableHostCheck: true
    },
  },
];
