import React from 'react';

import Room from './RoomAnaliticaComponent';

const url = 'https://api.p1.aldodaquino.com'

export default class AnaliticaSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: []
    }
  }

  componentDidMount() {
    // Getting rooms
    fetch(url+'/home')
    .then(response => response.json())
    .then(json => {
      this.setState({ rooms: json.rooms });
    });
  }

  roomsHtml = () => {
    let rows = [];
    for (var i = 0; i<this.state.rooms.length; i++) {
      const actualRoom = this.state.rooms[i];
      rows.push(
        <div key={i} href={i} className="room-section-wrapper">
          <h1>Room: <span className="room-name">{actualRoom.name}</span></h1>
          <Room url={url+'/room/'+actualRoom._id}/>
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
