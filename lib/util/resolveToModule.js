'use strict';

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var resolveToValue = require('./resolveToValue');

var isWindow = function isWindow(node) {
  return t.isMemberExpression(node) && (node.object.name === 'window' || node.object.name === 'global');
};

var isImport = function isImport(node) {
  return t.isImportSpecifier(node) || t.isImportDefaultSpecifier(node);
};

var isModule = function isModule(node) {
  return isImport(node) || isWindow(node) || t.isCallExpression(node) && node.callee.name === 'require';
};

var resolve = function resolve(node) {
  return isModule(node) || isWindow(node);
};

function resolveToModule(node, scope) {
  return resolveToValue(node, scope, resolve);
}

resolveToModule.isModule = isModule;

module.exports = resolveToModule;