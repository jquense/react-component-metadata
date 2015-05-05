let { types: t } = require('babel-core')
  , {
    parsePropTypes
  , parseDefaultProps } = require('./parseProps')
  , resolveToValue = require('./util/resolveToValue')
  , resolveToModule = require('./util/resolveToModule')
  , isReactImport = require('./util/isReactImport')
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


function isReactComponentClass(node, scope){
  //console.log(isReactImport(resolveToModule(node.superClass, scope)))

  return node.superClass 
    && node.superClass.property.name === 'Component'
    && isReactImport(resolveToModule(node.superClass, scope))
}

module.exports = function ClassVisitor(state, opts){
  var json = state.result
    , components = state.seen

  return {
    enter(node, parent, scope) {
      var isKnownComponent = isReactComponentClass(node, scope)

      if ( isKnownComponent || opts.inferComponent ){
        var component = node.id ? node.id.name : uuid('AnonymousComponent')
          , classBody = node.body.body
          , comment   = doc.parseCommentBlock(node)
          , propTypes = getClassInitializerPropTypes(classBody, scope)
          , defaultProps = getClassInitializerDefaults(classBody, scope);

        if ( isKnownComponent || propTypes || defaultProps ){
          components.push(component)

          json[component] = {
            props: {},
            desc: comment || ''
          }

          parsePropTypes(propTypes, json[component].props)
          parseDefaultProps(defaultProps, json[component].props, state.file)
        }
      }

      return node
    }
  }
}