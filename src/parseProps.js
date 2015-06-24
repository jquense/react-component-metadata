let { types: t } = require('babel-core')
  , resolveToModule = require('./util/resolveToModule')
  , doc = require('./util/comments')
  , path = require('path')

let isRequired = pt => t.isMemberExpression(pt) && pt.property.name === 'isRequired'

let raw = (node, src) => src.slice(node.start, node.end).toString()

function parsePropTypes(node, rslt = { props: {}, composes: [] }, scope) {
  var props = rslt.props;

  if ( !props) throw new Error()

  node && node.properties && node.properties.forEach(pt => {
    if ( t.isSpreadProperty(pt) ) {
      var module = scope && resolveToModule(pt.argument, scope)
        , name = !module ? null : path.basename(module.source.value, path.extname(module.source.value))

      if ( name && rslt.composes.indexOf(name) === -1 )
        rslt.composes.push(name)
    }
    else {
      props[pt.key.name] = props[pt.key.name] || {}

      props[pt.key.name] = {
        ...props[pt.key.name],
        type: getTypeFromPropType(pt.value),
        required: isRequired(pt.value),
        desc: doc.parseCommentBlock(pt) || ''
      }
    }
  })

  return rslt
}

function getTypeFromPropType(pt){

  if ( t.isMemberExpression(pt) ){
    if ( pt.property.name === 'isRequired')
      return getTypeFromPropType(pt.object)

    return { name: pt.property.name }
  }

  else if ( t.isCallExpression(pt) ){
    var name = pt.callee.property.name;

    if ( name === 'shape')
      return { name: 'object', value: parsePropTypes(pt.arguments[0]).props }

    else if ( name === 'instanceOf')
      return { name: pt.arguments[0].name }

    else if ( name === 'oneOfType')
      return { name: 'union', value: pt.arguments[0].elements.map(getTypeFromPropType) }

    else if ( name === 'oneOf'){
      var type = { name: 'enum' }
        , argument = pt.arguments[0];

      if ( t.isArrayExpression(argument) )
        type.value = argument.elements.map( el => el.raw)

      else if ( t.isMemberExpression(argument) )
        type.value = argument.property.value

      else if ( t.isIdentifier(argument) )
        type.value = argument.value

      return type
    }

    else if ( name === 'arrayOf')
      return { name: 'array', value: getTypeFromPropType(pt.arguments[0]) }

    else
      return { name }
  }
  else if ( t.isFunction(pt) )
    return { name: 'custom' }
}

module.exports = {

  parsePropTypes,

  parseDefaultProps(node, rslt = {}, src) {
    node && node.properties && node.properties
      .forEach( pt => {
        rslt[pt.key.name] = rslt[pt.key.name] || {}
        rslt[pt.key.name].defaultValue = raw(pt.value, src)
      })
      return rslt
  }
}