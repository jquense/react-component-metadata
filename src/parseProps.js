let { types: t } = require('babel-core')
  , doc = require('./util/comments')

let isRequired = pt => t.isMemberExpression(pt) && pt.property.name === 'isRequired'

let raw = (node, src) => src.slice(node.start, node.end).toString()

function parsePropTypes(node, rslt = {}) {
  node && node.properties && node.properties.forEach(pt => {
    rslt[pt.key.name] = rslt[pt.key.name] || {}

    rslt[pt.key.name] = {
      ...rslt[pt.key.name],
      type: getTypeFromPropType(pt.value),
      required: isRequired(pt.value),
      desc: doc.parseCommentBlock(pt) || ''
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
    var name = pt.callee.property.name

    if ( name === 'shape')
      return { name: 'object', value: parsePropTypes(pt.arguments[0]) }
    
    else if ( name === 'instanceOf')
      return { name: pt.arguments[0].name } 
    
    else if ( name === 'oneOfType')
      return { name: 'union', value: pt.arguments[0].elements.map(getTypeFromPropType) }
    
    else if ( name === 'oneOf')
      return { name: 'enum', value: pt.arguments[0].elements.map( el => el.raw)}

    else if ( name === 'arrayOf')
      return { name: 'array', value: getTypeFromPropType(pt.arguments[0]) }
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