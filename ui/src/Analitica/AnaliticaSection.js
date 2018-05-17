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

  render() {
    var rows = [];
    for (var i = 0; i<3; i++) {
      rows.push(<Room key={i} href={i}/>);
    }
    return (<div>{rows}</div>);
  };
}
