let {
    parsePropTypes
  , parseDefaultProps } = require('./parseProps')
  , resolveToValue = require('./util/resolveToValue')


module.exports = function(state, opts){
  var json = state.result
    , components = state.seen

  let isAssigning = (node, name) => node.operator === '=' && node.left.property && node.left.property.name === name

  let seenClass = (name, scope) => components.indexOf(name) !== -1 && scope.hasBinding(name)

  return {
    enter(node, parent, scope) {
      var component = node.left.object && node.left.object.name;

      if ( isAssigning(node, 'propTypes') && seenClass(component, scope))
        parsePropTypes(resolveToValue(node.right, scope), json[component], scope)

      else if ( isAssigning(node, 'defaultProps') && seenClass(component, scope) ){
        parseDefaultProps(resolveToValue(node.right, scope), json[component].props, state.file)
      }
    }
  }
}