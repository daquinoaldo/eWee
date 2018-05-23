import React from 'react';
import {MDCRipple} from '@material/ripple';

import * as api from '../remoteApi.js';

export default class FloatingAction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHidden: 'scale-to-zero'
    }
    this.actionButton = React.createRef();
  }

  componentDidMount() {
    MDCRipple.attachTo(this.actionButton.current);
  }

  newRoom = () => {
    let postValue = (api.url + '/home/room');
    var options = { method: 'POST',
      headers: new Headers({
       'Content-Type': 'application/json',
       Accept: 'application/json',
      }),
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify({'name': 'new room'})
    };
    fetch(postValue, options).then((res) => console.log(res));
  }

  collapse = () => {
    this.setState({
      isHidden: 'scale-to-zero'
    })
  }

  riseUp = () => {
    this.setState({
      isHidden: ''
    })
  }

  render() {
    const wrapperClasses = "white-margin absolute-center " + this.state.isHidden;
    return (
      <div className={wrapperClasses} onClick={this.newRoom}>
        <button ref={this.actionButton} className="mybutton mdc-fab material-icons" aria-label="Favorite">
          <span className="mdc-fab__icon">
            add
          </span>
        </button>
      </div>
  )};
}
