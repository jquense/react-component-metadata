'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('babel-core');

var t = _require.types;
var resolveToName = require('./util/resolveToName');
var doc = require('./util/comments');

var isRequired = function isRequired(pt) {
  return t.isMemberExpression(pt) && pt.property.name === 'isRequired';
};

var raw = function raw(node, src) {
  return node ? src.slice(node.start, node.end).toString() : undefined;
};

function getKeyName(pt) {
  if (pt.key.type === 'Literal') return pt.key.value; // 'aria-property'
  else return pt.key.name;
}

function parsePropTypes(node, rslt, scope) {
  if (rslt === undefined) rslt = { props: {}, composes: [] };

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
        type: getTypeFromPropType(pt.value),
        required: isRequired(pt.value),
        desc: doc.parseCommentBlock(pt) || ''
      });
    }
  });

  return rslt;
}

function getTypeFromPropType(_x) {
  var _again = true;

  _function: while (_again) {
    var pt = _x;
    _again = false;

    if (t.isMemberExpression(pt)) {
      if (pt.property.name === 'isRequired') {
        _x = pt.object;
        _again = true;
        continue _function;
      }

      return { name: pt.property.name };
    } else if (t.isCallExpression(pt)) {
      var name = '';

      if (t.isMemberExpression(pt.callee)) name = pt.callee.property.name;else if (t.isIdentifier(pt.callee)) name = pt.callee.name;

      if (name === 'shape') return { name: 'object', value: parsePropTypes(pt.arguments[0]).props };else if (name === 'instanceOf') return { name: pt.arguments[0].name };else if (name === 'oneOfType') return { name: 'union', value: pt.arguments[0].elements.map(getTypeFromPropType) };else if (name === 'oneOf') {
        var type = { name: 'enum' },
            argument = pt.arguments[0];

        if (t.isArrayExpression(argument)) type.value = argument.elements.map(function (el) {
          return el.raw;
        });else if (t.isMemberExpression(argument)) type.value = argument.property.value;else if (t.isIdentifier(argument)) type.value = argument.value;

        return type;
      } else if (name === 'arrayOf') return { name: 'array', value: getTypeFromPropType(pt.arguments[0]) };else return { name: name };
    } else if (t.isIdentifier(pt)) return { name: pt.name };else if (t.isFunction(pt)) return { name: 'custom' };
  }
}

module.exports = {

  parsePropTypes: parsePropTypes,

  parseDefaultProps: function parseDefaultProps(node, rslt, src, scope) {
    if (rslt === undefined) rslt = {};

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