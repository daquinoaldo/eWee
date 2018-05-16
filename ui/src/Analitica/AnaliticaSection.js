import React from 'react';

import ChartCard from './ChartCardComponent';
import ValueCard from './ValueCardComponent';

import * as api from './apiInterface.js';

var tempt = {title: 'Temperature', subtitle: 'room 123', description:'abc'}
var humidity = {subtitle: 'room 123', description:'abc'}

export default class AnaliticaSection extends React.Component {
  constructor(props) {
    super(props);
    this.temperatureChart = React.createRef();
  }

  componentDidMount() {
    api.cleanTimers();
    api.startTemptPulse(this.temperatureChart.current.updateGraph);
  }

  render() {
    return (
      <div className="mdc-layout-grid analitica-wrapper">
        <div className="mdc-layout-grid__inner">
          <div className="mdc-layout-grid__cell">
            <ChartCard ref={this.temperatureChart} descriptor={tempt} />
          </div>
          <div className="mdc-layout-grid__cell">
            <ValueCard descriptor={humidity} />
          </div>
        </div>
      </div>
  )};
}
