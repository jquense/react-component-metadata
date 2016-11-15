'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = visit;

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var find = require('lodash/collection/find'),
    doc = require('./util/comments');

var BLACKLIST = ['componentWillMount', 'componentDidMount', 'componentWillUpdate', 'componentDidUpdate', 'componentWillReceiveProps', 'componentWillUnmount', 'render', 'getInitialState', 'getDefaultProps', 'constructor'];

function getFunction(node) {
  var name = void 0,
      body = void 0;

  if (t.isObjectProperty(node) && t.isFunction(node.value)) {
    body = node.value;
    name = node.key.name;
  } else if (t.isObjectMethod(node) || t.isClassMethod(node)) {
    body = node;
    name = node.key.name;
  }

  if (name && BLACKLIST.indexOf(name) === -1) return { body: body, name: name };

  return null;
}

function visit(body) {
  var methods = {};

  body.forEach(function (node) {
    var _ref = getFunction(node) || {},
        body = _ref.body,
        name = _ref.name;

    if (!body) return;

    methods[name] = {
      desc: doc.parseCommentBlock(node)
    };
  });

  return methods;
}