var _require = require("babel-core");

var t = _require.types;
var find = require("lodash/collection/find");

var isResolvable = function (node) {
  return t.isObjectExpression(node) || t.isLiteral(node) || t.isIdentifier(node);
};

function resolveToValue(node, scope) {
  var resolve = arguments[2] === undefined ? isResolvable : arguments[2];

  if (t.isAssignmentExpression(node)) {
    return resolveToValue(node.right, scope, resolve);
  } else if (t.isVariableDeclarator(node)) {

    return resolveToValue(node.init, scope, resolve);
  } else if (t.isIdentifier(node)) {
    var name = node.name,
        binding = scope.getBinding(name);

    if (binding) {
      node = binding.path.container[0];

      // destructuring
      if (t.isObjectPattern(node.id)) {
        var prop = find(node.id.properties, function (p) {
          return p.value && p.value.name === name;
        });

        node = t.memberExpression(node.init, t.identifier(prop.key.name));
      }

      return resolveToValue(node, binding.scope, resolve);
    }
  } else if (resolve(node)) return node;
}

resolveToValue.isResolvable = isResolvable;

module.exports = resolveToValue;