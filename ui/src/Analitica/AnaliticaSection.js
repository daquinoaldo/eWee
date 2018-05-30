import React from 'react';

import Room from './RoomAnaliticaComponent';

import * as api from '../remoteApi.js';

export default class AnaliticaSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: []
    };
    this.roomsCmps = new Set();
  }

  update = () => {
    for (const room of this.roomsCmps) {
      if (room) room.update();
    }
  };

  componentDidMount() {
    // Getting rooms
    fetch(api.url+'/home')
    .then(response => response.json())
    .then(json => {
      this.setState({ rooms: json.rooms });
    });
  }

  roomsHtml = () => {
    this.roomsCmps.clear();
    let rows = [];
    for (var i = 0; i<this.state.rooms.length; i++) {
      const actualRoom = this.state.rooms[i];
      rows.push(
        <div key={i} href={i} className="room-section-wrapper">
          <h1>Room: <span className="room-name">{actualRoom.name}</span></h1>
          <Room ref={(ref) => this.roomsCmps.add(ref)} url={api.url+'/room/'+actualRoom._id}/>
        </div>
      );
    }
    return rows;
  };

  render() {
    return (
      <div className="section-wrapper">
        {this.roomsHtml()}
      </div>
    )};
}
