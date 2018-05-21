import React from 'react';

import Room from './RoomAnaliticaComponent';

export default class AnaliticaSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: []
    }
  }

  setRooms = () => {
    this.setState({ rooms: [] });
  }

  roomsHtml = () => {
    var rows = [];
    for (var i = 0; i<3; i++) {
      rows.push(
        <div key={i} href={i} className="room-section-wrapper">
          <h1>Room: <span className="room-name">123</span></h1>
          <Room />
        </div>
      );
    }
    return rows;
  }

  render() {
    return (
      <div className="analitica-section-wrapper">
        {this.roomsHtml()}
      </div>
    )};
}
