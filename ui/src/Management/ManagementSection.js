import React from 'react';

import {MDCRipple} from '@material/ripple';

import SensorChip from './SensorComponent';

var sensors = ['abc', '123', '456', '678']
const url = 'https://api.p1.aldodaquino.com'

export default class ManagementSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unboundDevices: []
    }
  }

  componentDidMount() {
    fetch(url+'/home')
    .then(response => response.json())
    .then(json => {
      this.setState({ unboundDevices: json.unboundDevices });
    });
  }

  sensorsHtml = () => {
    const shtml = [];
    const unbounded = this.state.unboundDevices;
    for (var i = 0; i<unbounded.length; i++) {
      shtml.push(
        <div className="sensor-flex-item" key={i}>
          <SensorChip uuid={unbounded[i]}/>
        </div>
      );
    }
    return shtml;
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
