'use strict';

var _require = require('babel-core');

var t = _require.types;
var resolveToModule = require('./resolveToModule');
var isReactImport = require('./isReactImport');

module.exports = function isReactComponentClass(node, scope) {
  return (t.isClassDeclaration(node) || t.isClassExpression(node)) && node.superClass && t.isMemberExpression(node.superClass) && node.superClass.property.name === 'Component' && isReactImport(resolveToModule(node.superClass, scope));
};