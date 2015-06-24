'use strict';

var _require = require('babel-core');

var t = _require.types;
var resolveToValue = require('./resolveToValue');

var isWindow = function isWindow(node) {
  return t.isMemberExpression(node) && (node.object.name === 'window' || node.object.name === 'global');
};

var isModule = function isModule(node) {
  return t.isImportDeclaration(node) || isWindow(node) || t.isCallExpression(node) && node.callee.name === 'require';
};

var resolve = function resolve(node) {
  return t.isMemberExpression(node) || isModule(node) || isWindow(node);
};

function resolveToModule(_x, _x2) {
  var _again = true;

  _function: while (_again) {
    var node = _x,
        scope = _x2;
    _again = false;

    node = resolveToValue(node, scope, resolve);

    if (isModule(node)) {
      //console.log(node)
      return node;
    } else if (t.isIdentifier(node)) {
      _x = node;
      _x2 = scope;
      _again = true;
      continue _function;
    } else if (t.isMemberExpression(node)) {
      while (node && t.isMemberExpression(node)) {
        node = node.object;
      }
      _x = node;
      _x2 = scope;
      _again = true;
      continue _function;
    }
  }
}

module.exports = resolveToModule;