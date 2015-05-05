var defaults = { prop: 'hi!'}

class StaticComponent extends React.Component {

  static propTypes = {
    prop: React.propTypes.string
  }

  render() {
    return <span/>;
  }
}

class AssignedComponent extends React.Component {

  static propTypes = {
    prop: React.propTypes.string
  }

  render() {
    return <span/>;
  }
}

var ClassicComponent = React.createClass({

  propTypes: {
    prop: React.propTypes.string
  },

  getDefaultProps(){},
  
  render() {
    return <span/>;
  }
})
