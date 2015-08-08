let { types: t } = require('babel-core')
  , resolveToModule = require('./resolveToModule')
  , isReactImport = require('./isReactImport');

function hasRender(classBody, scope){
  return classBody.body.some(
    node => t.isMethodDefinition(node) && node.key.name === 'render');
};

function extendsReactComponentClass(node, scope){
  return (t.isClassDeclaration(node) || t.isClassExpression(node))
    && node.superClass
    && t.isMemberExpression(node.superClass)
    && node.superClass.property.name === 'Component'
    && isReactImport(resolveToModule(node.superClass, scope))
}

function isClassWithRender(node, scope){
  return (t.isClassDeclaration(node) || t.isClassExpression(node))
    && hasRender(node.body)
}

module.exports = function isReactComponentClass(node, scope, infer = false){
  return extendsReactComponentClass(node, scope)
    || (infer && isClassWithRender(node))
}