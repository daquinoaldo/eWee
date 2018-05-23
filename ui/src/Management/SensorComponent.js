import React from 'react';

import {MDCChipSet} from '@material/chips';
import {MDCRipple} from '@material/ripple';

const url = 'https://api.p1.aldodaquino.com'

export default class SensorChip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: props.uuid,
      icon: (this.props.icon ? this.props.icon : 'default'),
    }
    this.sensorChip = React.createRef();
  }

  componentDidMount() {
    const chipSet = new MDCChipSet(this.sensorChip.current);
    MDCRipple.attachTo(this.sensorChip.current);
  }

  sendPost = () => {
    let postValue = (url + '/actuator/' + this.state.uuid);
    postValue += '/blink/';
    var options = { method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify({'value': 'on'})
    };
    fetch(postValue, options).then((res) => console.log(res));
  }

  iconBlink = () => {
    let stop = false;
    let i = 0;
    let blink = () => {
      if (this.state.icon == 'clear') { return null; };
      const newmod = (this.state.icon == 'blinking' ? 'standard' : 'blinking');
      this.setState({ icon: newmod });
      if (i < 5) { i++; setTimeout(blink, 500); }
    };
    blink();
  }

  unbindPost = () => {
    let targetUrl = (url + '/home/device/' + this.state.uuid);
    var options = { method: 'DELETE',
     headers: new Headers(),
     mode: 'cors',
     cache: 'default',
    };
    fetch(targetUrl, options).then((res) => console.log(res));
  }

  componentWillReceiveProps = (props) => {
    this.setState({icon: props.icon});
  }

  blink = () => {
    if (this.state.icon == 'clear') {
      this.unbindPost();
    }
    else {
      this.sendPost();
      this.iconBlink();
    }
  }

  render() {
    const iconClass = 'material-icons mdc-chip__icon mdc-chip__icon--leading sensor-chip-icon '
    const blink_visibility = (this.state.icon == 'blinking' ? 'sensor-icon-show' : 'sensor-icon-hide')
    const unchecked_visibility = (this.state.icon == 'clear'  ? 'sensor-icon-hide' : 'sensor-icon-show')
    const clear_visibility = (this.state.icon == 'clear' ? 'sensor-icon-show' : 'sensor-icon-hide')

    const blinkingIconClass = 'inner-radio ' + iconClass + blink_visibility;
    const clearIconClass = iconClass + clear_visibility;
    const defaultClass = iconClass + unchecked_visibility;
    return (
      <div ref={this.sensorChip} className="mdc-chip">
        <div className="sensor-chip-wrapper">
          <div className={blinkingIconClass}></div>
          <i className={clearIconClass}>clear</i>
          <i className={defaultClass} onClick={this.blink}>radio_button_unchecked</i>
        </div>
        <div className="mdc-chip__text">{this.state.uuid}</div>
      </div>
  )};
}
