var babel = require('babel-core')
  , docs = require('./util/comments')


function metadata(file, opts = {}){
  var state = {
    file,
    result: {},
    seen: []
  }

  function plugin(host) {
    var visitor = {

      AssignmentExpression: require('./assignment-visitor')(state, opts),

      Class: require('./class-visitor')(state, opts),

      CallExpression: require('./createClass-visitor')(state, opts)
    }

    if (opts.mixins) {
      visitor.VariableDeclarator = require('./mixin-visitor')(state, opts)
    }

    return new host.Plugin('process-react-classes', { visitor })
  }

  babel.transform(file, { code: false, stage: 0, plugins: [ plugin ] })

  return state.result
}

metadata.parseDoclets = docs.getDoclets

module.exports = metadata
