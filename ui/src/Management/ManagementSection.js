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
    this.roomsCmps = new Set();
    this.unboundedCmps = new Set();
  }


  // ----- ----- LIFECYCLE HOOKS ----- ----- //
  componentDidMount() {
    this.update();
  }


  // ----- ----- UPDATES ----- ----- //
  update = () => {
    // Updating room status
    api.get(api.url+'/home', (res, error) => {
      if (!error)
        this.setState({ unboundDevices: res.unboundDevices, rooms: res.rooms });
      else console.error(error);
    });

    // Updating unbound devices
    for (const s of this.unboundedCmps) {
      if (s) s.update();
    }
    // Updating rooms cards
    for (const room of this.roomsCmps) {
      if (room) room.update();
    }
  }


  // ----- ----- HTML RENDERERS ----- ----- //
  sensorsHtml = () => {
    this.unboundedCmps.clear();
    const shtml = [];
    const unbounded = this.state.unboundDevices;
    for (var i = 0; i < unbounded.length; i++) {
      shtml.push(
        <div className="flex-item" key={i}>
          <SensorChip ref={(ref) => this.unboundedCmps.add(ref)} uuid={unbounded[i]}/>
        </div>
      );
    }
    return shtml;
  }

  roomsHtml = () => {
    this.roomsCmps.clear();
    const shtml = [];
    for (var i = 0; i < this.state.rooms.length; i++) {
      const actualRoom = this.state.rooms[i];
      shtml.push(
        <div className="flex-item" key={i}>
          <RoomManagement ref={(ref) => this.roomsCmps.add(ref)} roomname={actualRoom.name} roomid={actualRoom._id}/>
        </div>
      );
    }
    return shtml;
  }

  render() {
    return (
      <div className="section-wrapper">
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
