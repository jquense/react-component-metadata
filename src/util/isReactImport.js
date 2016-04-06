import * as t from 'babel-types';

function isRequire(node){
  return t.isCallExpression(node)
      && node.arguments[0]
      && (node.arguments[0].value === 'react'
      || node.arguments[0].value === 'react/addons')
}

let isCorrectImport = node => (
  t.isImportDeclaration(node)
    && (node.source.value === 'react'
    || node.source.value === 'react/addons')

);

function isImport(node, scope){
  if (t.isImportSpecifier(node) || t.isImportDefaultSpecifier(node)) {
    let binding = scope.getBinding(node.local.name)
    node = binding.path.parent
  }

  return isCorrectImport(node)
}

function isGlobal(node) {
  return t.isMemberExpression(node)
      && (node.object.name === 'window' || node.object.name === 'global')
      && node.property.name === 'React'
}

module.exports = function (node, scope){
  return isRequire(node, scope)
      || isImport(node, scope)
      || isGlobal(node, scope)
}
