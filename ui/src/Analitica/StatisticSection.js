import React, { PureComponent } from 'react';
// import MomentUtils from 'material-ui-pickers/utils/moment-utils';
// import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
// import TimePicker from 'material-ui-pickers/TimePicker';

import * as utils from './chart.js';
import * as api from '../remoteApi.js';
import MaterialSelect from '../Policy/MaterialSelectComponent';

export default class StisticSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rooms: []
    }

    this.tmpCanvas = React.createRef();
    this.humCanvas = React.createRef();
    this.luxCanvas = React.createRef();
    this.occCanvas = React.createRef();
  }

  componentDidMount() {
    this.getRooms();
    // this.getData();

    this.cleanEnvir();

    let canvasCtx = this.tmpCanvas.current.getContext('2d');
    this.chart = utils.createChart(canvasCtx, 10, {min:15, max:45}, [20,25,35,45,51]);
  }

  getRooms = () => {
    api.get(api.url+'/home', (res, error) => {
      if (!error)
        this.setState({ rooms: res.rooms });
      else console.error(error);
    });
  }

  handleDateChange = (date) => {
   this.setState({ selectedDate: date });
  }

  cleanEnvir = () => {
    if(this.chart) this.chart.destroy();
  }

  render() {
    const { selectedDate } = new Date();
    return (
      <div className="section-wrapper">
        <div className="mdc-card chart-card-wrapper">
          <div className="mdc-card__actions">
            <div className="mdc-card__action-buttons">
              <MaterialSelect ref={this.pickedRoom} items={this.state.rooms} default='Pick a room' />

            </div>
          </div>
          <div>
            <canvas ref={this.tmpCanvas}></canvas>
            <canvas ref={this.humCanvas}></canvas>
            <canvas ref={this.luxCanvas}></canvas>
            <canvas ref={this.occCanvas}></canvas>
          </div>
        </div>
      </div>
    )};
}
