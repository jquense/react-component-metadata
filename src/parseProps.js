import * as t from 'babel-types';
let resolveToName = require('./util/resolveToName')
  , doc = require('./util/comments');

let isRequired = pt => t.isMemberExpression(pt) && pt.property.name === 'isRequired'

let raw = (node, src) => node ? src.slice(node.start, node.end).toString() : undefined

function getKeyName(pt) {
  // 'aria-property'
  if (t.isLiteral(pt.key))
    return pt.key.value;

  return pt.key.name;
}

function parsePropTypes(node, rslt = { props: {}, composes: [] }, scope) {
  var props = rslt.props;

  if ( !props) throw new Error()

  node && node.properties && node.properties.forEach(pt => {
    if (t.isSpreadProperty(pt)) {
      var name = scope && resolveToName(pt.argument, scope);

      if (name && rslt.composes.indexOf(name) === -1 )
        rslt.composes.push(name)
    }
    else {
      const keyName = getKeyName(pt);
      props[keyName] = props[keyName] || {}

      props[keyName] = {
        ...props[keyName],
        type: getTypeFromPropType(t.isObjectMethod(pt) ? pt : pt.value), // value || ObjectMethod,
        required: isRequired(pt.value),
        desc: doc.parseCommentBlock(pt) || ''
      }
    }
  })

  return rslt
}

function getTypeFromPropType(pt){

  if (t.isMemberExpression(pt)) {
    if (pt.property.name === 'isRequired')
      return getTypeFromPropType(pt.object)

    return { name: pt.property.name }
  }
  else if (t.isCallExpression(pt)) {
    let { callee, arguments: args } = pt;
    var name = '';

    if (t.isMemberExpression(callee))
      name = callee.property.name;

    else if ( t.isIdentifier(callee) )
      name = callee.name

    if ( name === 'shape')
      return { name: 'object', value: parsePropTypes(args[0]).props }

    else if ( name === 'instanceOf')
      return { name: args[0].name }

    else if ( name === 'oneOfType')
      return { name: 'union', value: args[0].elements.map(getTypeFromPropType) }

    else if ( name === 'oneOf'){
      var type = { name: 'enum' }
        , argument = args[0];

      if (t.isArrayExpression(argument))
        type.value = argument.elements.map((el) => {
          switch (el.type) {
            case 'NullLiteral':
              return 'null';
            case 'Identifier':
              return el.name;
            default:
              return el.extra ? el.extra.raw : String(el.value);
          }
        });

      else if ( t.isMemberExpression(argument) )
        type.value = argument.property.value

      else if (t.isIdentifier(argument))
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

  else if (t.isFunction(pt) || t.isObjectMethod(pt))
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
