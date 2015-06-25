'use strict';

var _require = require('babel-core');

var t = _require.types;
var resolveToValue = require('./resolveToValue');
var resolveToModule = require('./resolveToModule');
var isReactCreateClass = require('./isReactCreateClass');
var isReactComponentClass = require('./isReactComponentClass');
var path = require('path');

function resolve(node, scope) {
  return resolveToModule.isModule(node, scope) || isReactComponentClass(node, scope) || t.isVariableDeclarator(node) && isReactCreateClass(node.init.callee, scope);
}

function resolveToName(node, scope) {
  var name;

  node = resolveToValue(node, scope, resolve);

  if (node) {
    if (resolveToModule.isModule(node, scope)) name = path.basename(node.source.value, path.extname(node.source.value));else if (t.isClass(node)) name = node.id.name;else if (t.isVariableDeclarator(node)) name = node.id.name;else console.log('not module', node);
  } else {
    name = path.basename(node.source.value, path.extname(node.source.value));
  }

  return name;
}

module.exports = resolveToName;