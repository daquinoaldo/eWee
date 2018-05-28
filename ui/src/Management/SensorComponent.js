import React from 'react';

import {MDCChipSet} from '@material/chips';
import {MDCRipple} from '@material/ripple';

import * as api from '../remoteApi.js';

const INACTIVE_TIMEOUT = 15000 // * 60 * 60 * 60

export default class SensorChip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: true,
      uuid: props.uuid,
      icon: (this.props.icon ? this.props.icon : 'default'),
    }
    this.sensorChip = React.createRef();
  }

  // ----- ----- LIFECYCLE HOOKS ----- ----- //
  componentDidMount() {
    const chipSet = new MDCChipSet(this.sensorChip.current);
    MDCRipple.attachTo(this.sensorChip.current);

    this.update();
  }

  componentWillReceiveProps = (props) => {
    this.setState({icon: props.icon});
  }

  update = () => {
    this.isActive();
  }

  // ----- ----- UPDATES ----- ----- //
  isActive = () => {
    if (!this.state.active) {
      this.setState({active: true});
      return;
    } // Enable blinking advertisement

    let targetUrl = (api.url + '/sensor/' + this.state.uuid);
    api.get(targetUrl, (res, err) => {
      if (!err) {
        let now = new Date();
        let lastUpdate = new Date(res.timestamp);
        var diff = now - lastUpdate;
        if (diff > INACTIVE_TIMEOUT) this.setState({active: false});
      };
    });
  }


  // ----- ----- USER ACTIONS ----- ----- //
  iconClick = () => {
    if (this.state.icon == 'clear') {
      // Sending post to remove binding
      const targetUrl = (api.url + '/home/device/' + this.state.uuid);
      api.send(targetUrl, 'DELETE', null, (res, err) => {
        if(err) console.log(err);
      })
    }
    else {
      // Sending action to blink
      const targetUrl = (api.url + '/actuator/' + this.state.uuid + '/blink/');
      const data = {'value': 'on'};
      api.send(targetUrl, 'POST', data, (res, err) => {
        if(err) console.log(err);
      });
      // Blinking the icon
      this.iconBlinkAnimation();
    }
  }

  iconBlinkAnimation = () => {
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

  render() {
    const iconClass = 'material-icons mdc-chip__icon mdc-chip__icon--leading sensor-chip-icon '
    const blink_visibility = (this.state.icon == 'blinking' ? 'sensor-icon-show' : 'sensor-icon-hide')
    const unchecked_visibility = (this.state.icon == 'clear'  ? 'sensor-icon-hide' : 'sensor-icon-show')
    const clear_visibility = (this.state.icon == 'clear' ? 'sensor-icon-show' : 'sensor-icon-hide')

    const blinkingIconClass = 'inner-radio ' + iconClass + blink_visibility;
    const clearIconClass = iconClass + clear_visibility;
    const defaultClass = iconClass + unchecked_visibility;

    const inactiveClass = this.state.active ? '' : 'sensor-inactive';
    return (
      <div ref={this.sensorChip} className={"mdc-chip transition-color-chip "+ inactiveClass}>
        <div className="sensor-chip-wrapper">
          <div className={blinkingIconClass}></div>
          <i className={clearIconClass}>clear</i>
          <i className={defaultClass} onClick={this.iconClick}>radio_button_unchecked</i>
        </div>
        <div className="mdc-chip__text">{this.state.uuid}</div>
      </div>
  )};
}
