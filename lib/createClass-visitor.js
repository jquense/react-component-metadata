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
    resolveToName = require('./util/resolveToName'),
    isReactClass = require('./util/isReactCreateClass'),
    find = require('lodash/collection/find'),
    uuid = require('lodash/utility/uniqueId'),
    doc = require('./util/comments');

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
    enter: function enter(path) {
      var node = path.node,
          scope = path.scope;


      if (isReactClass(node.callee, scope)) {
        var spec = resolveToValue(node.arguments[0], scope).properties,
            comment = doc.parseCommentBlock(doc.findLeadingCommentNode(path)),
            component = getCreatClassName(spec, path, scope, comment),
            propTypes = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === 'propTypes';
        }),
            getDefaultProps = find(spec, function (node) {
          return (t.isProperty(node) || t.isObjectMethod(node)) && node.key.name === 'getDefaultProps';
        });

        components.push(component);

        json[component] = {
          props: {},
          composes: [],
          methods: (0, _componentBodyVisitor2.default)(spec),
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
          var body = (t.isProperty(getDefaultProps) ? getDefaultProps.value.body : getDefaultProps.body).body;

          var defaultProps = find(body, function (node) {
            return t.isReturnStatement(node) && (isResolvable(node.argument) || t.isIdentifier(node.argument));
          });

          if (defaultProps) parseDefaultProps(resolveToValue(defaultProps.argument, scope), json[component], state.file, scope);
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
    var name = resolveToName(mixin, scope);

    if (name && composes.indexOf(name) === -1) composes.push(name);
  });
}