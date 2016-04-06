'use strict';

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var resolveToValue = require('./resolveToValue'),
    resolveToModule = require('./resolveToModule'),
    isReactCreateClass = require('./isReactCreateClass'),
    isReactComponentClass = require('./isReactComponentClass'),
    path = require('path');

function resolve(node, scope) {
  return resolveToModule.isModule(node, scope) || isReactComponentClass(node, scope) || t.isVariableDeclarator(node) && node.init && node.init.callee && isReactCreateClass(node.init.callee, scope);
}

function resolveToName(node, scope) {
  var name;
  //console.log('hi!', node)
  node = resolveToValue(node, scope, resolve);

  if (node) {
    if (resolveToModule.isModule(node, scope)) {
      if (t.isImportSpecifier(node) || t.isImportDefaultSpecifier(node)) {
        var binding = scope.getBinding(node.local.name);
        node = binding.path.parent;
      }

      if (node.source) name = path.basename(node.source.value, path.extname(node.source.value));
    } else if (t.isClass(node)) name = node.id.name;else if (t.isVariableDeclarator(node)) name = node.id.name;
    //else console.log('not module', node)
  }

  return name || '';
}

module.exports = resolveToName;