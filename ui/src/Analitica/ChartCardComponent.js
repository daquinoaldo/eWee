import React from 'react';
import * as utils from './chart.js';

var timeTick = null;
var canvasCtx = null;

export default class ChartCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.descriptor.title,
      subtitle: this.props.descriptor.subtitle,
      description: this.props.descriptor.description
    }
    this.canvas = React.createRef();
    this._mount = false;
  }

  /*
   * @note !important: with routes it may happen that 'componentWillUnmount'
   *   will be invoked after 'componentDidMount' (e.g. fast switch between
   *   routes) so the environment should be cleaned by 'componentDidMount'
   *   otherwise 'componentWillUnmount' would mess up the work
   */
  componentDidMount() {
    this.cleanEnvir();

    canvasCtx = this.canvas.current.getContext('2d');
    this.chart = utils.createChart(canvasCtx, 10, {min:15, max:45});
    this._mount = true;
  }

  cleanEnvir = () => {
    if(this.chart) this.chart.destroy();
  }

  /*
   * Update the chart
   * @param item: the value to add to the graph
   */
  updateGraph = (v) => {
    if(!this._mount) return;
    // Updating the chart
    this.chart.data.datasets[0].data.shift();
    this.chart.data.datasets[0].data.push(v);
    this.chart.update();
  }

  render() {
    // const charContainer = { width: '300px', height:'300px' }
    const charContainer = {}
    return (
      <div className="mdc-card chart-card-wrapper">
        <div style={charContainer}>
          <canvas ref={this.canvas}></canvas>
        </div>
        <div className="card__primary">
          <h3 className="card__subtitle mdc-typography--subtitle2">{this.state.title}</h3>
        </div>
      </div>
  )};
}
