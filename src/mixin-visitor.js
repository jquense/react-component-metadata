import * as t from "babel-types";
let {
    parsePropTypes
  , parseDefaultProps } = require('./parseProps')
  , resolveToValue = require('./util/resolveToValue')
  , resolveToModule = require('./util/resolveToModule')
  , find = require('lodash/collection/find')
  , doc = require('./util/comments')
  , path = require('path');

let isResolvable = resolveToValue.isResolvable

function isMixin(node) {
  return t.isVariableDeclarator(node)
      && t.isIdentifier(node.id)
      && node.id.name.toLowerCase().indexOf('mixin') !== -1
}

module.exports = function(state, opts){
  var json = state.result;

  var testMixin = opts.isMixin || isMixin;

  return {
    enter(path) {
      let { node, scope } = path


      if ( testMixin(node) ) {
        var spec = resolveToValue(node.init, scope).properties
          , comment = doc.parseCommentBlock(doc.findLeadingCommentNode(path))
          , component = node.id.name
          , mixins = find(spec, node => t.isProperty(node) && node.key.name === 'mixins')
          , propTypes = find(spec, node => t.isProperty(node) && node.key.name === 'propTypes')
          , getDefaultProps = find(spec, node =>
              (t.isProperty(node) || t.isObjectMethod(node)) &&
              node.key.name === 'getDefaultProps'
            )

        json[component] = {
          props: {},
          composes: [],
          mixin: true,
          desc: comment || ''
        }

        if ( mixins && t.isArrayExpression(mixins.value) ){
          json[component].mixins = []
          parseMixins(mixins.value.elements, scope, json[component].mixins)
        }

        propTypes && parsePropTypes(resolveToValue(propTypes.value, scope), json[component], scope)

        if ( getDefaultProps ){
          let body = (t.isProperty(getDefaultProps) ? getDefaultProps.value.body :getDefaultProps.body).body;

          let defaultProps = find(body,
            node => t.isReturnStatement(node) && (isResolvable(node.argument) || t.isIdentifier(node.argument)) )

          if ( defaultProps )
            parseDefaultProps(resolveToValue(defaultProps.argument, scope), json[component], state.file)
        }
      }
    }
  }
}

function parseMixins(mixins = [], scope, composes){
  mixins.forEach( mixin => {
    var module = resolveToModule(mixin, scope)
      , name = !module ? null : path.basename(module.source.value, path.extname(module.source.value))

    if ( name && composes.indexOf(name) === -1)
      composes.push(name)
  })
}
