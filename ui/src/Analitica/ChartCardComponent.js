import React from 'react';
import * as utils from './chart.js';

var timeTick = null;
var canvasCtx = null;

export default class ChartCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      api_url: props.url,
      fetchData: props.dataFetcher,
      title: this.props.data.title,
      subtitle: this.props.data.subtitle,
      description: this.props.data.description
    }
    this.canvas = React.createRef();
  }

  /*
   * @note !important: with routes it may happen that 'componentWillUnmount'
   *   will be invoked after 'componentDidMount' (e.g. fast switch between
   *   routes) so the environment should be cleaned by 'componentDidMount'
   *   otherwise 'componentWillUnmount' would mess up the work
   */
  componentDidMount() {
    this.cleanEnvir();

    timeTick = setInterval(this.fetchData, 1000);
    canvasCtx = this.canvas.current.getContext('2d');
    utils.createChart(canvasCtx, 10, {min:15, max:35});
  }

  cleanEnvir = () => {
    clearInterval(timeTick);
    timeTick = null;
    utils.destroyChart();
  }

  /*
   * Fetches data from the rest api and convert it in plottable data
   */
  fetchData = () => {
    this.state.fetchData()
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
    // const charContainer = { width: '300px', height:'300px' }
    const charContainer = {}
    return (
      <div className="mdc-card wrapper">
        <div style={charContainer}>
          <canvas ref={this.canvas}></canvas>
        </div>
        <div className="card__primary">
          <h2 className="card__title mdc-typography--headline6">{this.state.title}</h2>
          <h3 className="card__subtitle mdc-typography--subtitle2">{this.state.subtitle}</h3>
        </div>
        <div className="card__secondary mdc-typography--body2">
          {this.state.description}
        </div>
      </div>
  )};
}
