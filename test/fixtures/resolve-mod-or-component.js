import React from 'react';

var ClassicComponent = React.createClass({
  render() {
    return <span/>;
  }
})

class ES6Component extends React.Component {
  render() {
    return <span/>;
  }
}

class GlobalComponent extends React.Component {
  static propTypes = {
    ...ES6Component.propTypes,
    ...ClassicComponent.propTypes
  }

  render() {
    return <span/>;
  }
}
