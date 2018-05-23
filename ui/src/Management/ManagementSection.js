import React from 'react';

import {MDCRipple} from '@material/ripple';

import SensorChip from './SensorComponent';
import RoomManagement from './RoomManagementComponent';

import * as api from '../remoteApi.js';

export default class ManagementSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unboundDevices: [],
      rooms: []
    }
  }

  componentDidMount() {
    fetch(api.url+'/home')
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({ unboundDevices: json.unboundDevices });
    });
    fetch(api.url+'/home')
      .then(response => response.json())
      .then(json => {
        this.setState({ rooms: json.rooms });
    });
  }

  sensorsHtml = () => {
    const shtml = [];
    const unbounded = this.state.unboundDevices;
    for (var i = 0; i < unbounded.length; i++) {
      shtml.push(
        <div className="flex-item" key={i}>
          <SensorChip uuid={unbounded[i]}/>
        </div>
      );
    }
    return shtml;
  }

  roomsHtml = () => {
    const shtml = [];
    for (var i = 0; i < this.state.rooms.length; i++) {
      const actualRoom = this.state.rooms[i];
      shtml.push(
        <div className="flex-item" key={i}>
          <RoomManagement roomname={actualRoom.name} roomid={actualRoom._id}/>
        </div>
      );
    }
    return shtml;
  }

  render() {
    return (
      <div className="management-wrapper">
        <h1>Available <span className="h1-blue">Sensors</span></h1>
        <div className="sensor-flex-wrapper">
          {this.sensorsHtml()}
        </div>
        <h1>Available <span className="h1-blue">rooms</span></h1>
        <div className="room-management-wrapper">
          {this.roomsHtml()}
        </div>
      </div>
  )};
}
