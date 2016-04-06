
module.exports = {
  devtool: 'inline-source-map',
  cache: true,

  module: {
    loaders: [
      { test: /sinon-chai/, loader: 'imports?define=>false' },
      { test: /\.js$/, loader: 'babel-loader', exclude: [/node_modules/, /fixtures/]}
    ]
  }
}
