'use strict';

var babelHelpers = require('./util/babelHelpers.js');

var _require = require('babel-core');

var t = _require.types;
var resolveToModule = require('./util/resolveToModule');
var doc = require('./util/comments');
var path = require('path');

var isRequired = function isRequired(pt) {
  return t.isMemberExpression(pt) && pt.property.name === 'isRequired';
};

var raw = function raw(node, src) {
  return src.slice(node.start, node.end).toString();
};

function parsePropTypes(node, _x, scope) {
  var rslt = arguments[1] === undefined ? { props: {}, composes: [] } : arguments[1];

  var props = rslt.props;

  if (!props) throw new Error();

  node && node.properties && node.properties.forEach(function (pt) {
    if (t.isSpreadProperty(pt)) {
      var module = scope && resolveToModule(pt.argument, scope),
          name = !module ? null : path.basename(module.source.value, path.extname(module.source.value));

      //console.log(module )
      name && rslt.composes.push(name);
    } else {
      props[pt.key.name] = props[pt.key.name] || {};

      props[pt.key.name] = babelHelpers._extends({}, props[pt.key.name], {
        type: getTypeFromPropType(pt.value),
        required: isRequired(pt.value),
        desc: doc.parseCommentBlock(pt) || ''
      });
    }
  });

  return rslt;
}

function getTypeFromPropType(_x3) {
  var _again = true;

  _function: while (_again) {
    var pt = _x3;
    name = undefined;
    _again = false;

    if (t.isMemberExpression(pt)) {
      if (pt.property.name === 'isRequired') {
        _x3 = pt.object;
        _again = true;
        continue _function;
      }

      return { name: pt.property.name };
    } else if (t.isCallExpression(pt)) {
      var name = pt.callee.property.name;

      if (name === 'shape') return { name: 'object', value: parsePropTypes(pt.arguments[0]).props };else if (name === 'instanceOf') return { name: pt.arguments[0].name };else if (name === 'oneOfType') return { name: 'union', value: pt.arguments[0].elements.map(getTypeFromPropType) };else if (name === 'oneOf') return { name: 'enum', value: pt.arguments[0].elements.map(function (el) {
          return el.raw;
        }) };else if (name === 'arrayOf') return { name: 'array', value: getTypeFromPropType(pt.arguments[0]) };
    } else if (t.isFunction(pt)) return { name: 'custom' };
  }
}

module.exports = {

  parsePropTypes: parsePropTypes,

  parseDefaultProps: function parseDefaultProps(node, _x2, src) {
    var rslt = arguments[1] === undefined ? {} : arguments[1];

    node && node.properties && node.properties.forEach(function (pt) {
      rslt[pt.key.name] = rslt[pt.key.name] || {};
      rslt[pt.key.name].defaultValue = raw(pt.value, src);
    });
    return rslt;
  }
};