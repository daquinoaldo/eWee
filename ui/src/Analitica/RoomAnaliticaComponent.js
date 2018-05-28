import React from 'react';

import ChartCard from './ChartCardComponent';
import ValueCard from './ValueCardComponent';

// import * as api from './apiInterface.js';

var tempt = {title: 'Temperature'}
var humidity = {title: 'Humidity'}
var light = {title: 'Light'}
var occupied = {title: 'Occupied'}

import * as api from '../remoteApi.js';

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

  update = () => {
    api.get(this.state.url, (res, err) => {
      if (!err) {
        console.log(res);
        // Temperature
        this.temperature.current.updateGraph(res.temp);
        // Humidity
        const humidity = res.humidity ? res.humidity + '%' : 'no data';
        this.humidity.current.updateValue(humidity);
        // Light
        const light = res.light ? res.light + 'lx' : 'no data';
        this.light.current.updateValue(light);
        // Presence
        const presence = res.occupied ? 'yes' : 'no';
        this.occupied.current.updateValue(presence);
      }
      else console.error(err);
    })
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
