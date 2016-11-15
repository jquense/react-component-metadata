'use strict';

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

var _componentBodyVisitor = require('./component-body-visitor');

var _componentBodyVisitor2 = _interopRequireDefault(_componentBodyVisitor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _require = require('./parseProps'),
    parsePropTypes = _require.parsePropTypes,
    parseDefaultProps = _require.parseDefaultProps,
    resolveToValue = require('./util/resolveToValue'),
    resolveToModule = require('./util/resolveToModule'),
    find = require('lodash/collection/find'),
    doc = require('./util/comments'),
    path = require('path');

var isResolvable = resolveToValue.isResolvable;

function isMixin(node) {
  return t.isVariableDeclarator(node) && t.isIdentifier(node.id) && node.id.name.toLowerCase().indexOf('mixin') !== -1;
}

module.exports = function (state, opts) {
  var json = state.result;

  var testMixin = opts.isMixin || isMixin;

  return {
    enter: function enter(path) {
      var node = path.node,
          scope = path.scope;


      if (testMixin(node)) {
        var spec = resolveToValue(node.init, scope).properties,
            comment = doc.parseCommentBlock(doc.findLeadingCommentNode(path)),
            component = node.id.name,
            mixins = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === 'mixins';
        }),
            propTypes = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === 'propTypes';
        }),
            getDefaultProps = find(spec, function (node) {
          return (t.isProperty(node) || t.isObjectMethod(node)) && node.key.name === 'getDefaultProps';
        });

        json[component] = {
          props: {},
          composes: [],
          methods: (0, _componentBodyVisitor2.default)(spec),
          mixin: true,
          desc: comment || ''
        };

        if (mixins && t.isArrayExpression(mixins.value)) {
          json[component].mixins = [];
          parseMixins(mixins.value.elements, scope, json[component].mixins);
        }

        propTypes && parsePropTypes(resolveToValue(propTypes.value, scope), json[component], scope);

        if (getDefaultProps) {
          var body = (t.isProperty(getDefaultProps) ? getDefaultProps.value.body : getDefaultProps.body).body;

          var defaultProps = find(body, function (node) {
            return t.isReturnStatement(node) && (isResolvable(node.argument) || t.isIdentifier(node.argument));
          });

          if (defaultProps) parseDefaultProps(resolveToValue(defaultProps.argument, scope), json[component], state.file);
        }
      }
    }
  };
};

function parseMixins() {
  var mixins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var scope = arguments[1];
  var composes = arguments[2];

  mixins.forEach(function (mixin) {
    var module = resolveToModule(mixin, scope),
        name = !module ? null : path.basename(module.source.value, path.extname(module.source.value));

    if (name && composes.indexOf(name) === -1) composes.push(name);
  });
}