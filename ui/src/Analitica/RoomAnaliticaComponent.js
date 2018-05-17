import React from 'react';

import ChartCard from './ChartCardComponent';
import ValueCard from './ValueCardComponent';

import * as api from './apiInterface.js';

var tempt = {title: 'Temperature', subtitle: 'room 123', description:'abc'}
var humidity = {title: 'Humidity', subtitle: 'room 123', description:'abc'}
var light = {title: 'Light', subtitle: 'room 123', description:'abc'}
var pir = {title: 'PIR', subtitle: 'room 123', description:'abc'}
var door = {title: 'Door', subtitle: 'room 123', description:'abc'}

export default class AnaliticaSection extends React.Component {
  constructor(props) {
    super(props);
    this.temperature = React.createRef();
    this.humidity = React.createRef();
    this.light = React.createRef();
    this.pir = React.createRef();
    this.door = React.createRef();
  }

  componentDidMount() {
    clearInterval(this.updateTimer);
    this.updateTimer = api.startFullDataPulse(
      this.temperature.current.updateGraph,
      this.humidity.current.updateValue,
      this.light.current.updateValue,
      this.pir.current.updateValue,
      this.door.current.updateValue
    );
  }

  render() {
    return (
      <div className="analitica-wrapper">
        <div className="flex-item">
          <ChartCard ref={this.temperature} descriptor={tempt} />
        </div>
        <div className="simple-data">
          <div className="flex-item">
            <ValueCard ref={this.humidity} descriptor={humidity} />
          </div>
          <div className="flex-item">
            <ValueCard ref={this.light} descriptor={light} />
          </div>
          <div className="flex-item">
            <ValueCard ref={this.pir} descriptor={pir} />
          </div>
          <div className="flex-item">
            <ValueCard ref={this.door} descriptor={door} />
          </div>
        </div>
      </div>
  )};
}
