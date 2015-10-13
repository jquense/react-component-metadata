'use strict';

var _require = require('babel-core');

var t = _require.types;

var _require2 = require('./parseProps');

var parsePropTypes = _require2.parsePropTypes;
var parseDefaultProps = _require2.parseDefaultProps;
var resolveToValue = require('./util/resolveToValue');
var resolveToName = require('./util/resolveToName');
var isReactClass = require('./util/isReactCreateClass');
var find = require('lodash/collection/find');
var uuid = require('lodash/utility/uniqueId');
var doc = require('./util/comments');
var path = require('path');

var isResolvable = resolveToValue.isResolvable;

function getCreatClassName(spec, visitor, scope, comment) {
  var parent = visitor.parentPath.node,
      displayName = find(spec || [], function (node) {
    return t.isProperty(node) && node.key.name === 'displayName';
  }),
      literal = displayName && resolveToValue(displayName.value, scope),
      doclets = doc.getDoclets(comment);

  if (doclets.alias || doclets.name) return doclets.alias || doclets.name;else if (literal) return literal.value;else if (t.isVariableDeclarator(parent)) return parent.id.name;else if (t.isProperty(parent)) return parent.key.name;

  return uuid('AnonymousComponent');
}

module.exports = function (state, opts) {
  var json = state.result,
      components = state.seen;

  return {
    enter: function enter(node, parent, scope) {

      if (isReactClass(node.callee, scope)) {
        var spec = resolveToValue(node.arguments[0], scope).properties,
            comment = doc.parseCommentBlock(doc.findLeadingCommentNode(this)),
            component = getCreatClassName(spec, this, scope, comment),
            propTypes = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === 'propTypes';
        }),
            getDefaultProps = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === 'getDefaultProps';
        });

        components.push(component);

        json[component] = {
          props: {},
          composes: [],
          desc: comment || ''
        };

        if (opts.mixins) {
          var mixins = find(spec, function (node) {
            return t.isProperty(node) && node.key.name === 'mixins';
          });

          if (mixins) {
            json[component].mixins = [];
            parseMixins(mixins.value.elements, scope, json[component].mixins);
          }
        }

        propTypes && parsePropTypes(resolveToValue(propTypes.value, scope), json[component], scope);

        if (getDefaultProps) {

          var defaultProps = find(getDefaultProps.value.body.body, function (node) {
            return t.isReturnStatement(node) && (isResolvable(node.argument) || t.isIdentifier(node.argument));
          });

          if (defaultProps) parseDefaultProps(resolveToValue(defaultProps.argument, scope), json[component], state.file, scope);
        }
      }
    }
  };
};

function parseMixins(mixins, scope, composes) {
  if (mixins === undefined) mixins = [];

  mixins.forEach(function (mixin) {
    var name = resolveToName(mixin, scope);

    if (name && composes.indexOf(name) === -1) composes.push(name);
  });
}