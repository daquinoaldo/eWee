import React from 'react';
import {MDCRipple} from '@material/ripple';

export default class FloatingAction extends React.Component {
  constructor(props) {
    super(props);
    this.ripple = React.createRef();
  }

  componentDidMount() {
    MDCRipple.attachTo(this.ripple.current);
  }

  render() {
    return (
      <button ref={this.ripple} className="fill-secondary mdc-button mdc-button--raised mdc-ripple-surface">
        Button
      </button>
  )};
}
