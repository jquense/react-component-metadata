'use strict';

var _require = require('babel-core');

var t = _require.types;
var resolveToModule = require('./resolveToModule');
var isReactImport = require('./isReactImport');

function hasRender(classBody, scope) {
  return classBody.body.some(function (node) {
    return t.isMethodDefinition(node) && node.key.name === 'render';
  });
};

function extendsReactComponentClass(node, scope) {
  return (t.isClassDeclaration(node) || t.isClassExpression(node)) && node.superClass && t.isMemberExpression(node.superClass) && node.superClass.property.name === 'Component' && isReactImport(resolveToModule(node.superClass, scope));
}

function isClassWithRender(node, scope) {
  return (t.isClassDeclaration(node) || t.isClassExpression(node)) && hasRender(node.body);
}

module.exports = function isReactComponentClass(node, scope) {
  var infer = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  return extendsReactComponentClass(node, scope) || infer && isClassWithRender(node);
};