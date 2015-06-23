'use strict';

var _require = require('babel-core');

var t = _require.types;
var find = require('lodash/collection/find');

var rDoclets = /^@(\w+)(?:$|\s((?:[^](?!^@\w))*))/gmi;

var isBlockComment = function isBlockComment(node) {
  return node.type === 'Block' && (node.value.indexOf('*\n') === 0 || node.value.indexOf('*\r\n') === 0);
};

var doc = module.exports = {

  findLeadingCommentNode: function findLeadingCommentNode(visitor) {
    var parent = visitor.parentPath.node;

    if (parent.leadingComments) return parent;

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

    for (; match; match = rDoclets.exec(str)) doclets[match[1]] = match[2] || true;

    return doclets;
  }
};