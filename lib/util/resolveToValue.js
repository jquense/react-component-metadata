'use strict';

var _require = require('babel-core');

var t = _require.types;
var find = require('lodash/collection/find');

var isResolvable = function isResolvable(node) {
  return t.isObjectExpression(node) || t.isLiteral(node);
};

function resolveToValue(_x2, _x3) {
  var _arguments = arguments;
  var _again = true;

  _function: while (_again) {
    var node = _x2,
        scope = _x3;
    resolve = name = binding = prop = undefined;
    _again = false;
    var resolve = _arguments[2] === undefined ? isResolvable : _arguments[2];

    if (resolve(node, scope)) {
      //console.log('resolved', node.type, resolve.name)
      return node;
    } else if (t.isAssignmentExpression(node)) {
      _arguments = [_x2 = node.right, _x3 = scope, resolve];
      _again = true;
      continue _function;
    } else if (t.isVariableDeclarator(node)) {
      //console.log('vd')
      _arguments = [_x2 = node.init, _x3 = scope, resolve];
      _again = true;
      continue _function;
    } else if (t.isMemberExpression(node)) {
      while (node && t.isMemberExpression(node)) {
        node = node.object;
      }
      _arguments = [_x2 = node, _x3 = scope, resolve];
      _again = true;
      continue _function;
    } else if (t.isIdentifier(node)) {
      var name = node.name,
          binding = scope.getBinding(name);

      if (!binding) {
        //console.log('ident', node)
        return node;
      }

      node = binding.path.container[binding.path.key];

      // destructuring
      if (t.isObjectPattern(node.id)) {
        var prop = find(node.id.properties, function (p) {
          return p.value && p.value.name === name;
        });

        node = t.memberExpression(node.init, t.identifier(prop.key.name));
      }

      //console.log('ident')
      _arguments = [_x2 = node, _x3 = binding.scope, resolve];
      _again = true;
      continue _function;
    }
    // else {
    //   console.log('not resolved')
    // }
  }
}

resolveToValue.isResolvable = isResolvable;

module.exports = resolveToValue

//var isReactComponentClass = require('./isReactComponentClass')
;