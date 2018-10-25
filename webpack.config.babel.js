import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import SimpleProgressWebpackPlugin from 'simple-progress-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

/**
 * Paths
 */
const ENV = process.env.NODE_ENV || 'development'
const PORT = process.env.PORT || 8080
const SOURCE_PATH = path.resolve(__dirname, './src')
const PUBLIC_PATH = path.resolve(__dirname, './public')
const DIST_PATH = path.resolve(__dirname, './dist')

/**
 * Base configuration
 */
const config = {
  mode: ENV === 'development' ? 'development' : 'production',

  output: {
    path: DIST_PATH,
    publicPath: ENV === 'publishing' ? './' : '/',
    filename: ENV === 'development' ? 'js/[name].js' : 'js/[name].[hash:16].js',
  },

  watch: ENV === 'development',

  watchOptions: {
    aggregateTimeout: 100,
  },

  devtool: ENV === 'development' && '#inline-source-map',

  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.HotModuleReplacementPlugin({
      multiStep: true,
    }),
    new webpack.NodeEnvironmentPlugin('NODE_ENV'),
    new SimpleProgressWebpackPlugin({
      format: ENV === 'development' ? 'minimal' : 'compact',
    }),
    new ExtractTextPlugin({
      filename: ENV === 'development' ? 'main.css' : 'main.[hash:16].css',
      allChunks: true,
      disable: ENV === 'development',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(PUBLIC_PATH, './index.html'),
    }),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(ENV),
    }),
    // new VueLoaderPlugin(),
    new ExtractTextPlugin({
      filename:
        ENV === 'development' ? 'css/main.css' : 'css/main.css?[hash:16]',
      disable: ENV === 'development',
      allChunks: true,
    }),
  ],

  resolve: {
    modules: ['node_modules', SOURCE_PATH],
    extensions: ['.js', '.jsx', '.vue', '.css'],
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      minChunks: 1,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
      },
    },
  },

  devServer: {
    port: PORT,
    contentBase: DIST_PATH,
    hot: true,
    historyApiFallback: true,
    open: true,
  },

  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.jsx?$/,
        exclude: [/node_modules/, /\.spec.js$/],
        include: [SOURCE_PATH],
      },

      {
        loader: 'url-loader',
        test: /\.(png|jpe?g|svg|ttf|eot|woff|woff2)$/,
        options: {
          limit: 8000,
        },
      },

      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
}

if (ENV === 'development') {
  config.plugins.push(
    new BundleAnalyzerPlugin({
      openAnalyzer: false,
    })
  )
}

if (ENV === 'production') {
  config.module.rules.push({
    test: /\.css$/,
    loader: ExtractTextPlugin.extract({
      use: 'css-loader?importLoaders=1&minimize=1!postcss-loader',
    }),
  })
}

export default config
