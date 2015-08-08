let { types: t } = require('babel-core')
  , {
    parsePropTypes
  , parseDefaultProps } = require('./parseProps')
  , resolveToValue = require('./util/resolveToValue')
  , isReactComponentClass = require('./util/isReactComponentClass')
  , find = require('lodash/collection/find')
  , uuid = require('lodash/utility/uniqueId')
  , doc = require('./util/comments')


function getClassInitializerPropTypes(classBody, scope){
  var type = find(classBody, node => t.isClassProperty(node) && node.key.name === 'propTypes' && node.static);
  return type && resolveToValue(type.value, scope)
}

function getClassInitializerDefaults(classBody, scope){
  var type = find(classBody, node => t.isClassProperty(node) && node.key.name === 'defaultProps' && node.static);
  return type && resolveToValue(type.value, scope)
}


module.exports = function ClassVisitor(state, opts){
  var json = state.result
    , components = state.seen

  return {
    enter(node, parent, scope) {
      var isKnownComponent = isReactComponentClass(node, scope, opts.inferComponent)

      if (isKnownComponent){
        var component = node.id ? node.id.name : uuid('AnonymousComponent')
          , classBody = node.body.body
          , comment   = doc.parseCommentBlock(node)
          , propTypes = getClassInitializerPropTypes(classBody, scope)
          , defaultProps = getClassInitializerDefaults(classBody, scope);

        components.push(component)

        json[component] = {
          props: {},
          composes: [],
          desc: comment || ''
        }

        parsePropTypes(propTypes, json[component], scope)
        parseDefaultProps(defaultProps, json[component].props, state.file)
      }

      return node
    }
  }
}