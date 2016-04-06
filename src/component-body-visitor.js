import * as t from 'babel-types';
let find = require('lodash/collection/find')
  , doc = require('./util/comments');

const BLACKLIST = [
  'componentWillMount',
  'componentDidMount',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillReceiveProps',
  'componentWillUnmount',
  'render',
  'getInitialState',
  'getDefaultProps',
  'constructor'
]

function getFunction(node) {
  let name, body;

  if (t.isObjectProperty(node) && t.isFunction(node.value)) {
    body = node.value;
    name = node.key.name;
  }
  else if (t.isObjectMethod(node) || t.isClassMethod(node)) {
    body = node
    name = node.key.name
  }

  if (name && BLACKLIST.indexOf(name) === -1)
    return { body, name }

  return null
}

export default function visit(body) {
  let methods = {};

  body.forEach(node => {
    let { body, name } = getFunction(node) || {}

    if (!body) return

    methods[name] = {
      desc: doc.parseCommentBlock(node)
    }
  })

  return methods
}
