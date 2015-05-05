var _require = require("babel-core");

var t = _require.types;
var resolveToValue = require("./resolveToValue");

var isWindow = function (node) {
  return t.isMemberExpression(node) && (node.object.name === "window" || node.object.name === "global");
};

var isModule = function (node) {
  return t.isImportDeclaration(node) || isWindow(node) || t.isCallExpression(node) && node.callee.name === "require";
};

var resolve = function (node) {
  return t.isMemberExpression(node) || isModule(node) || isWindow(node);
};

function resolveToModule(node, scope) {

  node = resolveToValue(node, scope, resolve);

  if (isModule(node)) {
    //console.log(node)
    return node;
  } else if (t.isIdentifier(node)) {
    return resolveToModule(node, scope);
  } else if (t.isMemberExpression(node)) {
    while (node && t.isMemberExpression(node)) {
      node = node.object;
    }
    return resolveToModule(node, scope);
  }
}

module.exports = resolveToModule;