import React from 'react';
import {MDCRipple} from '@material/ripple';

export default class FloatingAction extends React.Component {
  constructor(props) {
    super(props);
    this.actionButton = React.createRef();
  }

  componentDidMount() {
    MDCRipple.attachTo(this.actionButton.current);
  }

  render() {
    return (
      <button ref={this.actionButton} className="mybutton mdc-fab material-icons" aria-label="Favorite">
        <span className="mdc-fab__icon">
          add
        </span>
      </button>
  )};
}
