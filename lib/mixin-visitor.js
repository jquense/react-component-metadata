'use strict';

var _require = require('babel-core');

var t = _require.types;

var _require2 = require('./parseProps');

var parsePropTypes = _require2.parsePropTypes;
var parseDefaultProps = _require2.parseDefaultProps;
var resolveToValue = require('./util/resolveToValue');
var resolveToModule = require('./util/resolveToModule');
var find = require('lodash/collection/find');
var doc = require('./util/comments');
var path = require('path');

var isResolvable = resolveToValue.isResolvable;

function isMixin(node) {
  return t.isVariableDeclarator(node) && t.isIdentifier(node.id) && node.id.name.toLowerCase().indexOf('mixin') !== -1;
}

module.exports = function (state, opts) {
  var json = state.result;

  var testMixin = opts.isMixin || isMixin;

  return {
    enter: function enter(node, parent, scope) {
      //if ( !node.id.name ) console.log(node)

      if (testMixin(node)) {
        var spec = resolveToValue(node.init, scope).properties,
            comment = doc.parseCommentBlock(doc.findLeadingCommentNode(this)),
            component = node.id.name,
            mixins = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === 'mixins';
        }),
            propTypes = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === 'propTypes';
        }),
            getDefaultProps = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === 'getDefaultProps';
        });

        json[component] = {
          props: {},
          composes: [],
          mixin: true,
          desc: comment || ''
        };

        if (mixins && t.isArrayExpression(mixins.value)) {
          json[component].mixins = [];
          parseMixins(mixins.value.elements, scope, json[component].mixins);
        }

        propTypes && parsePropTypes(resolveToValue(propTypes.value, scope), json[component], scope);

        if (getDefaultProps) {
          var defaultProps = find(getDefaultProps.value.body.body, function (node) {
            return t.isReturnStatement(node) && (isResolvable(node.argument) || t.isIdentifier(node.argument));
          });

          if (defaultProps) parseDefaultProps(resolveToValue(defaultProps.argument, scope), json[component], state.file);
        }
      }
    }
  };
};

function parseMixins(mixins, scope, composes) {
  if (mixins === undefined) mixins = [];

  mixins.forEach(function (mixin) {
    var module = resolveToModule(mixin, scope),
        name = !module ? null : path.basename(module.source.value, path.extname(module.source.value));

    if (name && composes.indexOf(name) === -1) composes.push(name);
  });
}