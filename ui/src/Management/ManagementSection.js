import React from 'react';

import {MDCRipple} from '@material/ripple';

import SensorChip from './SensorComponent';

var sensors = ['abc', '123', '456', '678']

export default class ManagementSection extends React.Component {

  sensorsHtml = () => {
    var s = [];
    for (var i = 0; i<sensors.length; i++) {
      s.push(
        <div className="sensor-flex-item" key={i}>
          <SensorChip uuid={sensors[i]}/>
        </div>
      );
    }
    return s;
  }

  roomsHtml = () => {
    
  }

  render() {
    return (
      <div className="management-wrapper">
        <h1>Available <span className="h1-blue">Sensors</span></h1>
        <div className="sensor-flex-wrapper">
          {this.sensorsHtml()}
        </div>
        <h1>Available <span className="h1-blue">rooms</span></h1>
      </div>
  )};
}
