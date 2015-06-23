var webpack = require('webpack');

var config = pkg.babel

var loaders = [

    ];


module.exports = {
  test: {
    devtool: 'inline-source-map',
    cache: true,

    module: {
      loaders: [
        { test: /sinon-chai/, loader: "imports?define=>false" },
        { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/}
      ]
    }
  }
}
