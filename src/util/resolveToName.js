import * as t from 'babel-types';
let resolveToValue = require('./resolveToValue')
  , resolveToModule = require('./resolveToModule')
  , isReactCreateClass = require('./isReactCreateClass')
  , isReactComponentClass = require('./isReactComponentClass')
  , path = require('path');


function resolve(node, scope) {
  return resolveToModule.isModule(node, scope)
      || isReactComponentClass(node, scope)
      || (t.isVariableDeclarator(node)
      && node.init
      && node.init.callee
      && isReactCreateClass(node.init.callee, scope));
}


function resolveToName(node, scope){
  var name;
  //console.log('hi!', node)
  node = resolveToValue(node, scope, resolve)

  if (node) {
    if (resolveToModule.isModule(node, scope)){
      if (t.isImportSpecifier(node) || t.isImportDefaultSpecifier(node)) {
        let binding = scope.getBinding(node.local.name)
        node = binding.path.parent
      }

      if (node.source)
        name = path.basename(node.source.value, path.extname(node.source.value))
    }
    else if (t.isClass(node))
      name = node.id.name
    else if (t.isVariableDeclarator(node))
      name = node.id.name
    //else console.log('not module', node)
  }

  return name || ''
}

module.exports = resolveToName
