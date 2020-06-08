var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var inProduction = process.env.NODE_ENV === 'production';
var inTest = process.env.NODE_ENV === 'test';

module.exports = {
  entry: {
    app: [
      './client/app/routes.js',
    ]
  },
  output: {
    path: __dirname + '/client/dist/',
    publicPath: 'dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader']
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s[ac]ss$/,
        use: inProduction ? ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        }) : ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 100000,
              name: "[name].[hash].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['client/dist'], {})
  ],
  // resolve: {
  //   alias: {
  //     'vue$': 'vue/dist/vue.esm.js'
  //   }
  // },
  performance: {
    hints: false
  },
  devtool: 'cheap-module-inline-source-map'
}

if (inTest) {
  module.exports.plugins = [];
}

if (inProduction) {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new ExtractTextPlugin("main.css"),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
//    new webpack.optimize.UglifyJsPlugin({
//      sourceMap: true,
//      compress: {
//        warnings: false
//      }
//    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
