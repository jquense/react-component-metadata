let resolveToModule = require('./resolveToModule')
  , isReactImport = require('./isReactImport');

let isReactClass = (node, scope) => node.property
      && node.property.name === 'createClass'
      && isReactImport(resolveToModule(node.object, scope))

module.exports = isReactClass