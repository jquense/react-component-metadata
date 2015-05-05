var _require = require("babel-core");

var t = _require.types;

var _require2 = require("./parseProps");

var parsePropTypes = _require2.parsePropTypes;
var parseDefaultProps = _require2.parseDefaultProps;
var resolveToValue = require("./util/resolveToValue");
var resolveToModule = require("./util/resolveToModule");
var isReactImport = require("./util/isReactImport");
var find = require("lodash/collection/find");
var uuid = require("lodash/utility/uniqueId");
var doc = require("./util/comments");

var isResolvable = resolveToValue.isResolvable;

var isReactClass = function (node, scope) {
  return node.property && node.property.name === "createClass" && isReactImport(resolveToModule(node.object, scope));
};

function getCreatClassName(spec, visitor, scope, comment) {
  var parent = visitor.parentPath.node,
      displayName = find(spec || [], function (node) {
    return t.isProperty(node) && node.key.name === "displayName";
  }),
      literal = displayName && resolveToValue(displayName.value, scope),
      doclets = doc.getDoclets(comment);

  if (doclets.alias || doclets.name) return doclets.alias || doclets.name;else if (literal) return literal.value;else if (t.isVariableDeclarator(parent)) return parent.id.name;else if (t.isProperty(parent)) return parent.key.name;

  return uuid("AnonymousComponent");
}

module.exports = function (state, opts) {
  var json = state.result,
      components = state.seen;

  return {
    enter: function (node, parent, scope) {

      if (isReactClass(node.callee, scope) || opts.inferComponent) {
        var spec = resolveToValue(node.arguments[0], scope).properties,
            comment = doc.parseCommentBlock(doc.findLeadingCommentNode(this)),
            component = getCreatClassName(spec, this, scope, comment),
            propTypes = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === "propTypes";
        }),
            getDefaultProps = find(spec, function (node) {
          return t.isProperty(node) && node.key.name === "getDefaultProps";
        });

        components.push(component);

        json[component] = {
          props: {},
          desc: comment || ""
        };

        propTypes && parsePropTypes(resolveToValue(propTypes.value, scope), json[component].props);

        if (getDefaultProps) {
          var defaultProps = find(getDefaultProps.value.body.body, function (node) {
            return t.isReturnStatement(node) && isResolvable(node.argument);
          });

          if (defaultProps) parseDefaultProps(resolveToValue(defaultProps.argument, scope), json[component].props, state.file);
        }
      }
    }
  };
};