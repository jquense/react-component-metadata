let { types: t } = require('babel-core')
  , find = require('lodash/collection/find')

let rDoclets = /^@(\w+)(?:$|\s((?:[^](?!^@\w))*))/gmi;

let isBlockComment = node => node.type === 'CommentBlock'
  && (node.value.indexOf('*\n') === 0 || node.value.indexOf('*\r\n') === 0)

var doc = module.exports = {

  findLeadingCommentNode(visitor) {
    var parent = visitor.parentPath.node;

    if (parent.leadingComments )
      return parent

    return visitor.parentPath.parentPath.node
  },

  parseCommentBlock(node) {
    var comment = find(node && node.leadingComments, isBlockComment)
    return comment && doc.cleanComment(comment.value)
  },

  cleanComment(comment){
    return comment
      .split('\n')
      .map(str => str.replace(/^\s*\*\s?/, ''))
      .join('\n')
      .trim()
  },

  getDoclets(str) {
    var doclets = Object.create(null)
      , match = rDoclets.exec(str);

    for (; match; match = rDoclets.exec(str))
      doclets[match[1]] = match[2] || true;

    return doclets;
  }
}
