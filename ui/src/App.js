import React from 'react';
import './app.scss';

import {MDCRipple} from '@material/ripple';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.cnode = React.createRef();
  }

  componentDidMount() {
    // Applying ripple effect to current node buttons
    let rippledButtons = this.cnode.current.getElementsByClassName('mdc-button');
    for (let i = 0; i < rippledButtons.length; i++) {
        MDCRipple.attachTo(rippledButtons[i]);
    }
  }

  render() {
    return(
      <div ref={this.cnode}>
        <button className="foo-button mdc-button mdc-button--raised mdc-ripple-surface">
          Button
        </button>
        <button className="my-button mdc-button mdc-button--raised mdc-theme--secondary">
          Button
        </button>
      </div>
    )
  }
}
