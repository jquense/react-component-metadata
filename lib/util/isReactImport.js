'use strict';

var _require = require('babel-core');

var t = _require.types;

function isRequire(node) {
  return t.isCallExpression(node) && node.arguments[0] && (node.arguments[0].value === 'react' || node.arguments[0].value === 'react/addons');
}

var isCorrectImport = function isCorrectImport(node) {
  return t.isImportDeclaration(node) && (node.source.value === 'react' || node.source.value === 'react/addons');
};

function isImport(node) {
  //console.log((t.isImportSpecifier(node) || t.isImportDefaultSpecifier(node)) && node._paths[0].parentPath)
  return isCorrectImport(node) || (t.isImportSpecifier(node) || t.isImportDefaultSpecifier(node)) && isCorrectImport(node._paths[0].parentPath.parent);
}

function isGlobal(node) {
  return t.isMemberExpression(node) && (node.object.name === 'window' || node.object.name === 'global') && node.property.name === 'React';
}

module.exports = function (node) {
  return isRequire(node) || isImport(node) || isGlobal(node);
};