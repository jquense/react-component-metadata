let { types: t } = require('babel-core')
  , resolveToValue = require('./resolveToValue')

let isWindow = node => t.isMemberExpression(node) && (node.object.name === 'window' || node.object.name === 'global')

let isModule = node => t.isImportDeclaration(node) || isWindow(node) || (t.isCallExpression(node) && node.callee.name === 'require')

let resolve = node => t.isMemberExpression(node) || isModule(node) || isWindow(node)

function resolveToModule(node, scope){

  node = resolveToValue(node, scope, resolve)


  if ( isModule(node) ){
    //console.log(node)
    return node
  }
  else if( t.isIdentifier(node)) {
    return resolveToModule(node, scope)
  }
  else if( t.isMemberExpression(node)) {
    while (node && t.isMemberExpression(node)) {
      node = node.object;
    }
    return resolveToModule(node, scope)
  }
}

module.exports = resolveToModule