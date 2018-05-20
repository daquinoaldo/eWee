import React from 'react';

import {MDCRipple} from '@material/ripple';

import SensorChip from './SensorComponent';

var sensors = ['abc', '123', '456', '678']

export default class ManagementSection extends React.Component {

  sensorsHtml = () => {
    var s = [];
    for (var i = 0; i<sensors.length; i++) {
      s.push(
        <div className="sensor-flex-item">
          <SensorChip uuid={sensors[i]}/>
        </div>
      );
    }
    return s;
  }

  render() {
    return (
      <div className="management-wrapper">
        <div className="sensor-flex-wrapper">
          {this.sensorsHtml()}
        </div>
      </div>
  )};
}
