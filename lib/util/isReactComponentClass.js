'use strict';

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var resolveToModule = require('./resolveToModule'),
    isReactImport = require('./isReactImport');

function hasRender(classBody) {
  return classBody.body.some(function (node) {
    return t.isClassMethod(node) && node.key.name === 'render';
  });
}

function extendsReactComponentClass(node, scope) {

  return (t.isClassDeclaration(node) || t.isClassExpression(node)) && node.superClass && t.isMemberExpression(node.superClass) && node.superClass.property.name === 'Component' && isReactImport(resolveToModule(node.superClass, scope), scope);
}

function isClassWithRender(node) {
  return (t.isClassDeclaration(node) || t.isClassExpression(node)) && hasRender(node.body);
}

module.exports = function isReactComponentClass(node, scope) {
  var infer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


  return extendsReactComponentClass(node, scope) || infer && isClassWithRender(node);
};