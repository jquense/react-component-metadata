'use strict';

var babel = require('babel-core'),
    docs = require('./util/comments');

function metadata(file) {
  var opts = arguments[1] === undefined ? {} : arguments[1];

  var state = {
    file: file,
    result: {},
    seen: []
  };

  function plugin(host) {
    var visitors = {

      AssignmentExpression: require('./assignment-visitor')(state, opts),

      Class: require('./class-visitor')(state, opts),

      CallExpression: require('./createClass-visitor')(state, opts)
    };

    if (opts.mixins) {
      visitors.VariableDeclarator = require('./mixin-visitor')(state, opts);
    }

    return new host.Transformer('process-react-classes', visitors);
  }

  babel.transform(file, { code: false, stage: 0, plugins: [plugin] });

  return state.result;
}

metadata.parseDoclets = docs.getDoclets;

module.exports = metadata;