
require('babel-core/register')({ stage: 0 })

var chai = require('chai')

chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))

chai.should();

// chai.Assertion.includeStack = true