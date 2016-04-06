'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _require = require('./parseProps');

var parsePropTypes = _require.parsePropTypes;
var parseDefaultProps = _require.parseDefaultProps;
var resolveToValue = require('./util/resolveToValue');
var isReactComponentClass = require('./util/isReactComponentClass');
var find = require('lodash/collection/find');
var uuid = require('lodash/utility/uniqueId');
var doc = require('./util/comments');

function getClassInitializerPropTypes(classBody, scope) {
  var type = find(classBody, function (node) {
    return t.isClassProperty(node) && node.key.name === 'propTypes' && node.static;
  });
  return type && resolveToValue(type.value, scope);
}

function getClassInitializerDefaults(classBody, scope) {
  var type = find(classBody, function (node) {
    return t.isClassProperty(node) && node.key.name === 'defaultProps' && node.static;
  });
  return type && resolveToValue(type.value, scope);
}

module.exports = function ClassVisitor(state, opts) {
  var json = state.result,
      components = state.seen;

  return {
    enter: function enter(_ref) {
      var node = _ref.node;
      var scope = _ref.scope;

      var isKnownComponent = isReactComponentClass(node, scope, opts.inferComponent);

      if (isKnownComponent) {
        var component = node.id ? node.id.name : uuid('AnonymousComponent'),
            classBody = node.body.body,
            comment = doc.parseCommentBlock(node),
            propTypes = getClassInitializerPropTypes(classBody, scope),
            defaultProps = getClassInitializerDefaults(classBody, scope);

        components.push(component);

        json[component] = _extends({
          props: {},
          composes: [],
          desc: comment || ''
        }, json[component]);

        parsePropTypes(propTypes, json[component], scope);
        parseDefaultProps(defaultProps, json[component], state.file, scope);
      }
    }
  };
};