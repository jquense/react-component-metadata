import * as t from 'babel-types';
let resolveToModule = require('./resolveToModule')
  , isReactImport = require('./isReactImport');

function hasRender(classBody) {
  return classBody.body.some(
    node => t.isClassMethod(node) && node.key.name === 'render');
}

function extendsReactComponentClass(node, scope) {

  return (t.isClassDeclaration(node) || t.isClassExpression(node))
    && node.superClass
    && t.isMemberExpression(node.superClass)
    && node.superClass.property.name === 'Component'
    && isReactImport(resolveToModule(node.superClass, scope), scope)
}

function isClassWithRender(node) {
  return (t.isClassDeclaration(node) || t.isClassExpression(node))
    && hasRender(node.body)
}

module.exports = function isReactComponentClass(node, scope, infer = false) {

  return extendsReactComponentClass(node, scope)
    || (infer && isClassWithRender(node))
}
