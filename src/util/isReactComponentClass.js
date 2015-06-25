let { types: t } = require('babel-core')
  , resolveToModule = require('./resolveToModule')
  , isReactImport = require('./isReactImport');

module.exports = function isReactComponentClass(node, scope){
  return (t.isClassDeclaration(node) || t.isClassExpression(node))
    && node.superClass
    && t.isMemberExpression(node.superClass)
    && node.superClass.property.name === 'Component'
    && isReactImport(resolveToModule(node.superClass, scope))
}