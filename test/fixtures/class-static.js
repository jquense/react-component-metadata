'use strict';
var React  = require('react');

/**
 * Description of my Component
 */
class StaticComponent extends React.Component {

  static defaultProps = {
    'aria-property': 'aria-value',
    stringProp: 'form',
    boolProp: true,
    funcProp: (path, model) => getter(path)(model),
    shapeProp: { setter: ()=>{}, name: 'John' },
  }

  static propTypes = {

    /**
     * An object hash of field errors for the form.
     */
    objProp: React.PropTypes.object,

    reqProp: React.PropTypes.object.isRequired,

    /**
     * Callback **that** is called when a validation error occurs.
     */
    funcProp:   React.PropTypes.func,

    stringProp: React.PropTypes.string,

    boolProp:   React.PropTypes.bool,

    'aria-property': React.PropTypes.string,

    enumProp:   React.PropTypes.oneOf([true, 'john', 5, null, Infinity]),

    otherProp:  React.PropTypes.instanceOf(Message),

    shapeProp:  React.PropTypes.shape({
                  setter: React.PropTypes.func,
                  name: React.PropTypes.string
                }),

    unionProp: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.string
    ]),

    reqUnionProp: React.PropTypes.oneOfType([
      React.PropTypes.func,
      React.PropTypes.string
    ]).isRequired,

    customProp(props, name, componentName) {
      return React.PropTypes.any.isRequired(props, name, componentName)
    },

    customIdentifier: someValidator,

    customCallExpression: someValidator()
  }

  render() {
    return <span/>;
  }
}
