'use strict';

var resolveToModule = require('./resolveToModule'),
    isReactImport = require('./isReactImport');

var isReactClass = function isReactClass(node, scope) {
      return node.property && node.property.name === 'createClass' && isReactImport(resolveToModule(node.object, scope), scope);
};

module.exports = isReactClass;