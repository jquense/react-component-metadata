
let { types: t } = require('babel-core')
  , find = require('lodash/collection/find')

let isResolvable = node => t.isObjectExpression(node) || t.isLiteral(node) || t.isIdentifier(node) 

function resolveToValue(node, scope, resolve = isResolvable){

  if( t.isAssignmentExpression(node)){
    return resolveToValue(node.right, scope, resolve)
  }
  else if ( t.isVariableDeclarator(node) ) {
    
    return resolveToValue(node.init, scope, resolve)
  }   
  else if ( t.isIdentifier(node) ){
    var name = node.name
      , binding = scope.getBinding(name)

    if ( binding ){
      node = binding.path.container[0]

      // destructuring
      if ( t.isObjectPattern(node.id) ){
        var prop = find(node.id.properties, p => p.value && p.value.name === name)

        node = t.memberExpression(node.init, t.identifier(prop.key.name))
      }

      return resolveToValue(node, binding.scope, resolve)
    }
  }
  else if ( resolve(node) )
    return node
}


resolveToValue.isResolvable = isResolvable

module.exports = resolveToValue