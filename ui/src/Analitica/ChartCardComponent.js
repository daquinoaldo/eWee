import React from 'react';
import * as utils from './chart.js';

export default class ChartCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      api_url: props.url
    }
  }

  componentDidMount() {
    this.timeTick = setInterval(this.fetchData, 1000);
    var ctx = document.getElementById("the-chart").getContext('2d');
    utils.createChart(ctx, 10, {min:15, max:35});
  }

  /*
   * Fetches data from the rest api and convert it in plottable data
   */
  fetchData = () => {
    fetch('https://jsonplaceholder.typicode.com/posts/1')
    .then(result=>result.json())
    .then(items=>{ this.updateData(items) });
  }

  /*
   * Update the chart
   * @param item: the value to add to the graph
   */
  updateData = (item) => {
    let newValue = 20+Math.floor(Math.random(10) * 10);
    utils.updateChart(newValue);
  }

  render() {
    return (
      <div className="mdc-card wrapper">
        <canvas id="the-chart" width="100" height="100"></canvas>
        <div className="card__primary">
          <h2 className="card__title mdc-typography--headline6">Our Changing Planet</h2>
          <h3 className="card__subtitle mdc-typography--subtitle2">by Kurt Wagner</h3>
        </div>
        <div className="card__secondary mdc-typography--body2">
          Visit ten places on our planet that are undergoing the biggest changes today.
        </div>
      </div>
  )};
}
