//require('babel-core/register')({ stage: 0 })

var babel = require('babel-core')

//var src = fs.readFileSync('./test/fixtures/resolve.js')


module.exports = function(file, opts = {}){
  var state = {
    file,
    result: {},
    seen: []
  }

  function plugin(host) {
    return new host.Transformer('process-react-classes', {

      AssignmentExpression: require('./assignment-visitor')(state, opts),

      Class: require('./class-visitor')(state, opts),

      CallExpression: require('./createClass-visitor')(state, opts)
    })
  }

  babel.transform(file, { code: false, stage: 0, plugins: [ plugin ] })

  return state.result
}



