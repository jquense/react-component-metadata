'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var resolveToName = require('./util/resolveToName'),
    doc = require('./util/comments');

var isRequired = function isRequired(pt) {
  return t.isMemberExpression(pt) && pt.property.name === 'isRequired';
};

var raw = function raw(node, src) {
  return node ? src.slice(node.start, node.end).toString() : undefined;
};

function getKeyName(pt) {
  // 'aria-property'
  if (t.isLiteral(pt.key)) return pt.key.value;

  return pt.key.name;
}

function parsePropTypes(node) {
  var rslt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { props: {}, composes: [] };
  var scope = arguments[2];

  var props = rslt.props;

  if (!props) throw new Error();

  node && node.properties && node.properties.forEach(function (pt) {
    if (t.isSpreadProperty(pt)) {
      var name = scope && resolveToName(pt.argument, scope);

      if (name && rslt.composes.indexOf(name) === -1) rslt.composes.push(name);
    } else {
      var keyName = getKeyName(pt);
      props[keyName] = props[keyName] || {};

      props[keyName] = _extends({}, props[keyName], {
        type: getTypeFromPropType(t.isObjectMethod(pt) ? pt : pt.value), // value || ObjectMethod,
        required: isRequired(pt.value),
        desc: doc.parseCommentBlock(pt) || ''
      });
    }
  });

  return rslt;
}

function getTypeFromPropType(pt) {

  if (t.isMemberExpression(pt)) {
    if (pt.property.name === 'isRequired') return getTypeFromPropType(pt.object);

    return { name: pt.property.name };
  } else if (t.isCallExpression(pt)) {
    var callee = pt.callee,
        args = pt.arguments;

    var name = '';

    if (t.isMemberExpression(callee)) name = callee.property.name;else if (t.isIdentifier(callee)) name = callee.name;

    if (name === 'shape') return { name: 'object', value: parsePropTypes(args[0]).props };else if (name === 'instanceOf') return { name: args[0].name };else if (name === 'oneOfType') return { name: 'union', value: args[0].elements.map(getTypeFromPropType) };else if (name === 'oneOf') {
      var type = { name: 'enum' },
          argument = args[0];

      if (t.isArrayExpression(argument)) type.value = argument.elements.map(function (el) {
        switch (el.type) {
          case 'NullLiteral':
            return 'null';
          case 'Identifier':
            return el.name;
          default:
            return el.extra ? el.extra.raw : String(el.value);
        }
      });else if (t.isMemberExpression(argument)) type.value = argument.property.value;else if (t.isIdentifier(argument)) type.value = argument.value;

      return type;
    } else if (name === 'arrayOf') return { name: 'array', value: getTypeFromPropType(pt.arguments[0]) };else return { name: name };
  } else if (t.isIdentifier(pt)) return { name: pt.name };else if (t.isFunction(pt) || t.isObjectMethod(pt)) return { name: 'custom' };
}

module.exports = {

  parsePropTypes: parsePropTypes,

  parseDefaultProps: function parseDefaultProps(node) {
    var rslt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var src = arguments[2];
    var scope = arguments[3];

    if (!rslt.props) rslt.props = {};

    node && node.properties && node.properties.forEach(function (pt) {
      if (t.isSpreadProperty(pt)) {
        var name = scope && resolveToName(pt.argument, scope);

        if (!rslt.composes) rslt.composes = [];

        if (name && rslt.composes.indexOf(name) === -1) rslt.composes.push(name);
      } else if (pt.key) {

        var keyName = getKeyName(pt);

        rslt.props[keyName] = rslt.props[keyName] || {};
        rslt.props[keyName].defaultValue = raw(pt.value, src);
        rslt.props[keyName].computed = !t.isLiteral(pt.value);
      }
    });
    return rslt;
  }
};