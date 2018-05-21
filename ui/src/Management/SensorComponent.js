import React from 'react';

import {MDCChipSet} from '@material/chips';
import {MDCRipple} from '@material/ripple';

export default class SensorChip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: props.uuid,
      blinking: false
    }
    this.sensorChip = React.createRef();
  }

  componentDidMount() {
    const chipSet = new MDCChipSet(this.sensorChip.current);
    MDCRipple.attachTo(this.sensorChip.current);
  }

  blink = () => {
    for (let i=0; i<6; i++) {
      setTimeout(() => {
        this.setState({ blinking:  !this.state.blinking })
      }, i*500);
    }
  }

  render() {
    const basicClass = 'inner-radio material-icons mdc-chip__icon mdc-chip__icon--leading sensor-chip-icon';
    const checkedClass = basicClass + (this.state.blinking ? ' sensor-chip-visible' : '');
    console.log(checkedClass);
    return (
      <div ref={this.sensorChip} className="mdc-chip">
        <div className={checkedClass} onClick={this.blink}></div>
        <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">radio_button_unchecked</i>
        <div className="mdc-chip__text">{this.state.uuid}</div>
      </div>
  )};
}
