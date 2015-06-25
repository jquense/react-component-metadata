var { React } = window

var defaults = { prop: 'hi!'}

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



// not a leading comment
class ES6Component extends React.Component {

  static propTypes = propTypes

  render() {
    return <span/>;
  }
}

ES6Component.defaultProps = defaults

var ClassicComponent = React.createClass(spec)

