import React from 'react';

import * as utils from './chart.js';
import * as api from '../remoteApi.js';
import MaterialSelect from '../Policy/MaterialSelectComponent';

export default class StisticSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rooms: []
    };
    this.pickedRoom = React.createRef();
    this.dateInput = React.createRef();
    // Canvases
    this.tmpCanvas = React.createRef();
    this.humCanvas = React.createRef();
    this.luxCanvas = React.createRef();
    this.occCanvas = React.createRef();
  }

  componentDidMount() {
    this.getRooms();

    this.cleanEnvir();

    let tempCtx = this.tmpCanvas.current.getContext('2d');
    this.tmpChart = utils.createChart(tempCtx, '°C', 24, {min:15, max:45}, null, '#f44336');

    let humCtx = this.humCanvas.current.getContext('2d');
    this.humChart = utils.createChart(humCtx, '%', 24, {min:0, max:100}, null, '');

    let luxCtx = this.luxCanvas.current.getContext('2d');
    this.luxChart = utils.createChart(luxCtx, 'lx', 24, {min:0, max:1200}, null, '#ffca28');

    let occCtx = this.occCanvas.current.getContext('2d');
    this.occChart = utils.createChart(occCtx, 'occupancy', 24, {min:0, max:1}, null, '#757575');
  }

  getRooms = () => {
    api.get(api.url+'/home', (res, error) => {
      if (!error)
        this.setState({ rooms: res.rooms });
      else console.error(error);
    });
  };

  getStatics = (room) => {
    if (!room) room = this.pickedRoom.current.getSelected();
    const date = this.dateInput.current.valueAsDate;

    if (room.name!='Pick a room' && date) {
      const roomid = room._id;
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const targetUrl = api.url + '/room/' + roomid + '/stats/' + year + '/' + month + '/' + day;
      api.get(targetUrl, (res, err) => {
        if (err) { console.log(err); }
        // Chart data
        let tmpData = this.tmpChart.data.datasets[0];
        let humData = this.humChart.data.datasets[0];
        let luxData = this.luxChart.data.datasets[0];
        let occData = this.occChart.data.datasets[0];
        // this.chart.update();

        let nZeros = (n) => { return Array.from(new Array(n), (x,i) => null); };
        let nTmpData = nZeros(24);
        let nHumData = nZeros(24);
        let nLuxData = nZeros(24);
        let nOccData = nZeros(24);
        if (res) {
          for (let i=0; i<res.hour.length; i++) {
            const j = res.hour[i];
            nTmpData[j] = res.temp[i];
            nHumData[j] = res.humidity[i];
            nLuxData[j] = res.light[i];
            nOccData[j] = res.occupied[i];
          }
        }
        tmpData.data = nTmpData;
        this.tmpChart.update();
        humData.data = nHumData;
        this.humChart.update();
        luxData.data = nLuxData;
        this.luxChart.update();
        occData.data = nOccData;
        this.occChart.update();
      });
    }
  };

  cleanEnvir = () => {
    if(this.tmpChart) this.tmpChart.destroy();
    if(this.humChart) this.humChart.destroy();
    if(this.luxChart) this.luxChart.destroy();
    if(this.occChart) this.occChart.destroy();
  };

  render() {
    const alignRooms_date = { 'width': '100%', 'justifyContent': 'space-around'};
    const alignDate = {'transform': 'TranslateY(25%)'};
    return (
      <div className="section-wrapper">
        <div className="mdc-card statics-chart-card-wrapper">
          <div className="mdc-card__actions">
            <div style={alignRooms_date} className="mdc-card__action-buttons">
              <MaterialSelect ref={this.pickedRoom} items={this.state.rooms} callback={this.getStatics} default='Pick a room' />
              <input ref={this.dateInput} style={alignDate} className="material-date-picker" type="date" onChange={() => this.getStatics()} />
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
