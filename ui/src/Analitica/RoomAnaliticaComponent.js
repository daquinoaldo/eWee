import React from 'react';

import ChartCard from './ChartCardComponent';
import ValueCard from './ValueCardComponent';

import * as api from './apiInterface.js';

var tempt = {title: 'Temperature'}
var humidity = {title: 'Humidity'}
var light = {title: 'Light'}
var occupied = {title: 'Occupied'}

export default class AnaliticaSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: props.url
    }

    this.temperature = React.createRef();
    this.humidity = React.createRef();
    this.light = React.createRef();
    this.occupied = React.createRef();
  }

  componentDidMount() {
    clearInterval(this.updateTimer);
    this.updateTimer = api.startFullDataPulse(
      this.state.url,
      this.temperature.current.updateGraph,
      this.humidity.current.updateValue,
      this.light.current.updateValue,
      this.occupied.current.updateValue
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
            <ValueCard ref={this.occupied} descriptor={occupied} />
          </div>
        </div>
      </div>
  )};
}
