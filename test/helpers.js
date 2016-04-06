var metadata = require('../src')
  , fs = require('fs')


module.exports = function(fixture, options = {}){
  return metadata(
      fs.readFileSync(require.resolve('./fixtures/' + fixture), 'utf8')
    , options)
}
