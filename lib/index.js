var babel = require("babel-core");

module.exports = function (file) {
  var opts = arguments[1] === undefined ? {} : arguments[1];

  var state = {
    file: file,
    result: {},
    seen: []
  };

  function plugin(host) {
    return new host.Transformer("process-react-classes", {

      AssignmentExpression: require("./assignment-visitor")(state, opts),

      Class: require("./class-visitor")(state, opts),

      CallExpression: require("./createClass-visitor")(state, opts)
    });
  }

  babel.transform(file, { code: false, stage: 0, plugins: [plugin] });

  return state.result;
};