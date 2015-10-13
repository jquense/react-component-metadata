'use strict';

var _require = require('./parseProps');

var parsePropTypes = _require.parsePropTypes;
var parseDefaultProps = _require.parseDefaultProps;
var resolveToValue = require('./util/resolveToValue');

module.exports = function (state, opts) {
  var json = state.result,
      components = state.seen;

  var isAssigning = function isAssigning(node, name) {
    return node.operator === '=' && node.left.property && node.left.property.name === name;
  };

  var seenClass = function seenClass(name, scope) {
    return components.indexOf(name) !== -1 && scope.hasBinding(name);
  };

  return {
    enter: function enter(node, parent, scope) {
      var component = node.left.object && node.left.object.name;

      if (isAssigning(node, 'propTypes') && seenClass(component, scope)) parsePropTypes(resolveToValue(node.right, scope), json[component], scope);else if (isAssigning(node, 'defaultProps') && seenClass(component, scope)) {
        parseDefaultProps(resolveToValue(node.right, scope), json[component], state.file, scope);
      }
    }
  };
};