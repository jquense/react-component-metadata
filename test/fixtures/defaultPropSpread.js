var React  = require('react');

class Component extends React.Component {
  static defaultProps = {
    prop: 'boom'
  }

  render() {
    return <span/>;
  }
}

Component.defaultProps = {
  ...Component.defaultProps,
  anotherProp: ()=>{}
}