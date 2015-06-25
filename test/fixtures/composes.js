import React from 'react';
import Other from './Other';
import MyMixin from './MyMixin'


class ES6Component extends React.Component {

  render() {
    return <span/>;
  }
}

ES6Component.propTypes = {
  ...Other.propTypes,
  prop: React.PropTypes.string
}

class ES7Component extends React.Component {
  static propTypes = {
    ...Other.propTypes,
    ...ES6Component.propTypes,
    prop: React.PropTypes.string
  }

  render() {
    return <span/>;
  }
}

var ClassicComponent = React.createClass({
  propTypes: {
    ...Other.propTypes,
    prop: React.PropTypes.string
  },

  mixins: [ MyMixin ],

  render() {
    return <span/>;
  }
})