'use strict';

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var find = require('lodash/collection/find');

var rDoclets = /^@(\w+)(?:$|\s((?:[^](?!^@\w))*))/gmi;

var isBlockComment = function isBlockComment(node) {
  return node.type === 'CommentBlock' && (node.value.indexOf('*\n') === 0 || node.value.indexOf('*\r\n') === 0);
};

var doc = module.exports = {
  findLeadingCommentNode: function findLeadingCommentNode(visitor) {
    var parent = visitor.parentPath.node;

    if (parent.leadingComments || parent.trailingComments) return parent;

    return visitor.parentPath.parentPath.node;
  },
  parseCommentBlock: function parseCommentBlock(node) {
    var comment = find(node && node.leadingComments, isBlockComment);

    return comment && doc.cleanComment(comment.value);
  },
  cleanComment: function cleanComment(comment) {
    return comment.split('\n').map(function (str) {
      return str.replace(/^\s*\*\s?/, '');
    }).join('\n').trim();
  },
  getDoclets: function getDoclets(str) {
    var doclets = Object.create(null),
        match = rDoclets.exec(str);

    for (; match; match = rDoclets.exec(str)) {
      doclets[match[1]] = match[2] || true;
    }return doclets;
  }
};