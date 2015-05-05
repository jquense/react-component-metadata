let { types: t } = require('babel-core')

let rDoclets = /^@(\w+)(?:$|\s((?:[^](?!^@\w))*))/gmi;

var doc = module.exports = {

  findLeadingCommentNode(visitor) {
    var parent = visitor.parentPath.node;
    
    if (parent.leadingComments)
      return parent

    return visitor.parentPath.parentPath.node
  },

  parseCommentBlock(node) {
    return node && node.leadingComments && doc.cleanComment(node.leadingComments[0].value)
  },

  cleanComment(comment){
    return comment
      .split('\n')
      .map(str => str.replace(/^\s*\*\s?/, '').trim())
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