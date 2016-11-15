'use strict';

var _babylon = require('babylon');

var babylon = _interopRequireWildcard(_babylon);

var _babelTraverse = require('babel-traverse');

var _babelTraverse2 = _interopRequireDefault(_babelTraverse);

var _comments = require('./util/comments');

var _comments2 = _interopRequireDefault(_comments);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function metadata(file) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var state = {
    file: file,
    result: {},
    seen: []
  };

  var visitor = {

    AssignmentExpression: require('./assignment-visitor')(state, opts),

    Class: require('./class-visitor')(state, opts),

    CallExpression: require('./createClass-visitor')(state, opts)
  };

  if (opts.mixins) {
    visitor.VariableDeclarator = require('./mixin-visitor')(state, opts);
  }

  var ast = babylon.parse(file, {
    sourceType: 'module',
    plugins: ['asyncFunctions', 'jsx', 'flow', 'classConstructorCall', 'doExpressions', 'trailingFunctionCommas', 'objectRestSpread', 'decorators', 'classProperties', 'exportExtensions', 'exponentiationOperator', 'asyncGenerators', 'functionBind', 'functionSent']
  });

  (0, _babelTraverse2.default)(ast, visitor);

  return state.result;
}

metadata.parseDoclets = _comments2.default.getDoclets;

module.exports = metadata;