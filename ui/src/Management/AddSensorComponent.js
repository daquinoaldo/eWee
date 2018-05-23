import React from 'react';

import {MDCChipSet} from '@material/chips';
import {MDCRipple} from '@material/ripple';


export default class AddSensorChip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomid: props.roomid,
    }
    this.sensorChip = React.createRef();
  }

  componentDidMount() {
    const chipSet = new MDCChipSet(this.sensorChip.current);
    MDCRipple.attachTo(this.sensorChip.current);
  }

  clickAction = () => {
    console.log(42);
  }

  render() {
    const iconClass = 'material-icons mdc-chip__icon mdc-chip__icon--leading sensor-chip-icon '

    return (
      <div ref={this.sensorChip} className="mdc-chip">
        <div className="sensor-chip-wrapper">
          <i className='add-icon-correction material-icons mdc-chip__icon mdc-chip__icon--leading sensor-chip-icon' onClick={this.clickAction}>add</i>
        </div>
      </div>
  )};
}
