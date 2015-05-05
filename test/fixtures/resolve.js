var { React } = window

var propTypes = {
  /**
   * prop description
   */
  prop: React.propTypes.string
}

var spec = {

  propTypes: propTypes,

  getDefaultProps(){
    return defaults
  },
  
  render() {
    return <span/>;
  }
}

var defaults = { prop: 'hi!'}

class ES6Component extends React.Component {

  static propTypes = propTypes

  render() {
    return <span/>;
  }
}

ES6Component.defaultProps = defaults

var ClassicComponent = React.createClass(spec)

