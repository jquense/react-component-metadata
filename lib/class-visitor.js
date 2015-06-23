'use strict';

var _require = require('babel-core');

var t = _require.types;

var _require2 = require('./parseProps');

var parsePropTypes = _require2.parsePropTypes;
var parseDefaultProps = _require2.parseDefaultProps;
var resolveToValue = require('./util/resolveToValue');
var resolveToModule = require('./util/resolveToModule');
var isReactImport = require('./util/isReactImport');
var find = require('lodash/collection/find');
var uuid = require('lodash/utility/uniqueId');
var doc = require('./util/comments');

function getClassInitializerPropTypes(classBody, scope) {
  var type = find(classBody, function (node) {
    return t.isClassProperty(node) && node.key.name === 'propTypes' && node['static'];
  });
  return type && resolveToValue(type.value, scope);
}

function getClassInitializerDefaults(classBody, scope) {
  var type = find(classBody, function (node) {
    return t.isClassProperty(node) && node.key.name === 'defaultProps' && node['static'];
  });
  return type && resolveToValue(type.value, scope);
}

function isReactComponentClass(node, scope) {
  //console.log(isReactImport(resolveToModule(node.superClass, scope)))

  return node.superClass && node.superClass.property.name === 'Component' && isReactImport(resolveToModule(node.superClass, scope));
}

module.exports = function ClassVisitor(state, opts) {
  var json = state.result,
      components = state.seen;

  return {
    enter: function enter(node, parent, scope) {
      var isKnownComponent = isReactComponentClass(node, scope);

      if (isKnownComponent || opts.inferComponent) {
        var component = node.id ? node.id.name : uuid('AnonymousComponent'),
            classBody = node.body.body,
            comment = doc.parseCommentBlock(node),
            propTypes = getClassInitializerPropTypes(classBody, scope),
            defaultProps = getClassInitializerDefaults(classBody, scope);

        if (isKnownComponent || propTypes || defaultProps) {
          components.push(component);

          json[component] = {
            props: {},
            composes: [],
            desc: comment || ''
          };

          parsePropTypes(propTypes, json[component], scope);
          parseDefaultProps(defaultProps, json[component].props, state.file);
        }
      }

      return node;
    }
  };
};