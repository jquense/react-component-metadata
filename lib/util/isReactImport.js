'use strict';

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function isRequire(node) {
  return t.isCallExpression(node) && node.arguments[0] && (node.arguments[0].value === 'react' || node.arguments[0].value === 'react/addons');
}

var isCorrectImport = function isCorrectImport(node) {
  return t.isImportDeclaration(node) && (node.source.value === 'react' || node.source.value === 'react/addons');
};

function isImport(node, scope) {
  if (t.isImportSpecifier(node) || t.isImportDefaultSpecifier(node)) {
    var binding = scope.getBinding(node.local.name);
    node = binding.path.parent;
  }

  return isCorrectImport(node);
}

function isGlobal(node) {
  return t.isMemberExpression(node) && (node.object.name === 'window' || node.object.name === 'global') && node.property.name === 'React';
}

module.exports = function (node, scope) {
  return isRequire(node, scope) || isImport(node, scope) || isGlobal(node, scope);
};