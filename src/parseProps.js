let { types: t } = require('babel-core')
  , resolveToName = require('./util/resolveToName')
  , doc = require('./util/comments');

let isRequired = pt => t.isMemberExpression(pt) && pt.property.name === 'isRequired'

let raw = (node, src) => node ? src.slice(node.start, node.end).toString() : undefined

function getKeyName(pt) {
  if (pt.key.type === 'Literal') return pt.key.value; // 'aria-property'
  else return pt.key.name;
}

function parsePropTypes(node, rslt = { props: {}, composes: [] }, scope) {
  var props = rslt.props;

  if ( !props) throw new Error()

  node && node.properties && node.properties.forEach(pt => {
    if ( t.isSpreadProperty(pt) ) {
      var name = scope && resolveToName(pt.argument, scope);

      if ( name && rslt.composes.indexOf(name) === -1 )
        rslt.composes.push(name)
    }
    else {
      const keyName = getKeyName(pt);
      props[keyName] = props[keyName] || {}

      props[keyName] = {
        ...props[keyName],
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
    var name = '';

    if ( t.isMemberExpression(pt.callee) )
      name = pt.callee.property.name;

    else if ( t.isIdentifier(pt.callee) )
      name = pt.callee.name

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
  else if ( t.isIdentifier(pt) )
    return { name: pt.name }

  else if ( t.isFunction(pt) )
    return { name: 'custom' }
}

module.exports = {

  parsePropTypes,

  parseDefaultProps(node, rslt = {}, src, scope) {
    if (!rslt.props)
      rslt.props = {};

    node && node.properties && node.properties
      .forEach(pt => {
        if (t.isSpreadProperty(pt)) {
          var name = scope && resolveToName(pt.argument, scope);

          if (!rslt.composes)
            rslt.composes = [];

          if (name && rslt.composes.indexOf(name) === -1)
            rslt.composes.push(name)
        }
        else if (pt.key) {
          const keyName = getKeyName(pt);
          rslt.props[keyName] = rslt.props[keyName] || {}
          rslt.props[keyName].defaultValue = raw(pt.value, src)
          rslt.props[keyName].computed = !t.isLiteral(pt.value)
        }
      })
      return rslt
  }
}
