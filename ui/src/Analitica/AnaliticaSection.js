import React from 'react';

import ChartCard from './ChartCardComponent';
import ValueCard from './ValueCardComponent';

var tempt = {title: 'Temperature', subtitle: 'room 123', description:'abc'}
var humidity = {subtitle: 'room 123', description:'abc'}

var temptUpdate = (toUpdate) => {
  console.log(2);
  fetch('http://p1.aldodaquino.com:3000/sensor/00:00:00:00:00:00')
  .then(response => response.json())
  .then(json => console.log(json));
}

export default class AnaliticaSection extends React.Component {
  constructor(props) {
    super(props);
    this.temperatureChart = React.createRef();
    setTimeout(() => { temptUpdate() }, 1);
  }

  render() {
    return (
      <div className="analitica_wrapper">
        <ChartCard ref={this.temperatureChart} descriptor={tempt} />
      </div>
  )};
}
