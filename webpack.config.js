const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const apiurl = process.env.API_URL;
const urlFilters = [
  /js\.rmtag\.com/,
  /ct1\.ra\.linksynergy\.com/,
  /nyt2\.dc-storm\.com/,
  /track\.linksynergy/,
  /tags\.(mediaforge|rd\.linksynergy)\.com/,
  /(ads|ads\-us|amp)\.(mediaforge|rd\.linksynergy)\.com/,
  /www\.facebook\.com\/tr/,
  /connect\.facebook/,
  /pixel\.mathtag\.com/,
  /act-us\.rd\.linksynergy\.com/,
  /act-jp\.rd\.linksynergy\.com/,
  /nxtck\.com/,
  /insight\.adsrvr\.org/,
  /10\.134\.34\.51/,
  /\.xg4ken\.com/
];

module.exports = {
  entry: {
    // Each entry in here would declare a file that needs to be transpiled
    // and included in the extension source.
    background: './src/core/background.js',
    popup: './src/core/popup.js',
    content: './src/core/content.js'
  },
  output: {
    // This copies each source entry into the extension dist folder named
    // after its entry config key.
    path: path.join(path.resolve(__dirname), 'extension', 'dist'),
    filename: '[name].js',
  },
  module: {
    // This transpiles all code (except for third party modules) using Babel.
    rules: [{
      exclude: /node_modules/,
      test: /\.js$/,
      // Babel options are in .babelrc
      use: 'babel-loader',
    },
      {
        test: /\.(s*)css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader'],
        })
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }
      },
    ],
  },
  resolve: {
    // This allows you to import modules just like you would in a NodeJS app.
    extensions: ['.js', '.jsx'],
    modules: [
      'src',
      'node_modules',
    ],
  },
  plugins: [
    new ExtractTextPlugin({ filename: 'app.bundle.css' }),
    // Since some NodeJS modules expect to be running in Node, it is helpful
    // to set this environment var to avoid reference errors.
    new webpack.DefinePlugin({
      URL_FILTERS: urlFilters,
      API_URL: JSON.stringify(apiurl),

    }),
  ],
  // This will expose source map files so that errors will point to your
  // original source files instead of the transpiled files.
  devtool: 'sourcemap',
};
