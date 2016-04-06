import * as babylon from 'babylon';
import traverse from 'babel-traverse';
import docs from './util/comments'

function metadata(file, opts = {}){
  var state = {
    file,
    result: {},
    seen: []
  }

  var visitor = {

    AssignmentExpression: require('./assignment-visitor')(state, opts),

    Class: require('./class-visitor')(state, opts),

    CallExpression: require('./createClass-visitor')(state, opts)
  }

  if (opts.mixins) {
    visitor.VariableDeclarator = require('./mixin-visitor')(state, opts)
  }

  let ast = babylon.parse(file, {
    sourceType: 'module',
    plugins: [
      'asyncFunctions',
      'jsx',
      'flow',
      'classConstructorCall',
      'doExpressions',
      'trailingFunctionCommas',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'exponentiationOperator',
      'asyncGenerators',
      'functionBind',
      'functionSent'
    ]
  })

  traverse(ast, visitor)

  return state.result
}

metadata.parseDoclets = docs.getDoclets

module.exports = metadata
