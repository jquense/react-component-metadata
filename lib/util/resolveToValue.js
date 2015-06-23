'use strict';

var _require = require('babel-core');

var t = _require.types;
var find = require('lodash/collection/find');

var isResolvable = function isResolvable(node) {
  return t.isObjectExpression(node) || t.isLiteral(node) || t.isIdentifier(node);
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

    if (t.isAssignmentExpression(node)) {
      _arguments = [_x2 = node.right, _x3 = scope, resolve];
      _again = true;
      continue _function;
    } else if (t.isVariableDeclarator(node)) {
      _arguments = [_x2 = node.init, _x3 = scope, resolve];
      _again = true;
      continue _function;
    } else if (t.isIdentifier(node)) {
      var name = node.name,
          binding = scope.getBinding(name);

      if (binding) {
        node = binding.path.container[binding.path.key];

        // destructuring
        if (t.isObjectPattern(node.id)) {
          var prop = find(node.id.properties, function (p) {
            return p.value && p.value.name === name;
          });

          node = t.memberExpression(node.init, t.identifier(prop.key.name));
        }

        _arguments = [_x2 = node, _x3 = binding.scope, resolve];
        _again = true;
        continue _function;
      }
    } else if (resolve(node)) return node;
  }
}

resolveToValue.isResolvable = isResolvable;

module.exports = resolveToValue;