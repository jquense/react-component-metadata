import React, { PropTypes } from 'react';

var react = require('react/addons')

var { React: R3 } = window

var react = require('react')

var R = React
  , R2 = react;

class ES6Component extends R.Component {
  render() {
    return <span/>;
  }
}

class GlobalComponent extends R3.Component {
  render() {
    return <span/>;
  }
}

var ClassicComponent = R2.createClass({
  render() {
    return <span/>;
  }
})
