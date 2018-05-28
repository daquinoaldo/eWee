import React from 'react';

import MaterialSelect from './MaterialSelectComponent';
import Alert from './AlertComponent';

import * as api from '../remoteApi.js';

export default class PolicySection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rooms: [],
    }
    this.menu = React.createRef();
    this.selection = React.createRef();
    this.pickedRoom = React.createRef();
    // Policy values
    this.emptyTmpMax = React.createRef(); this.emptyTmpMin = React.createRef();
    this.occTmpMin = React.createRef(); this.occTmpMax = React.createRef();
    this.occCo2Max = React.createRef(); this.occLxMin = React.createRef();
  }

  // ----- ----- LIFECYCLE HOOKS ----- ----- //
  update = () => {

  }

  componentDidMount() {
    const targetUrl = api.url+'/home';
    api.get(targetUrl, (res, error) => {
      if (!error)
        this.setState({ rooms: res.rooms });
      else console.error(error);
    });
  }


  // ----- ----- USER ACTIONS ----- ----- //
  openMenu = () => {
    this.mdcMenu.open = !this.menu.open;
  }

  sendPolicy = () => {
    const roomid = this.pickedRoom.current.getSelected()._id
    const emptyPolicy = {
      temp: {
        min: this.emptyTmpMin.current.getSelected(),
        max: this.emptyTmpMax.current.getSelected()
      }
    }
    const occupiedPolicy = {
      temp: {
        min: this.occTmpMin.current.getSelected(),
        max: this.occTmpMax.current.getSelected()
      },
      light: this.occLxMin.current.getSelected(),
      carbon: this.occCo2Max.current.getSelected()
    }
    const policy = {
      room: roomid,
      empty: emptyPolicy,
      occupied: occupiedPolicy
    }
    const targetUrl = api.url + '/policy/' + roomid
    api.send(targetUrl, 'POST', policy, (res, error) => {
      if (error) console.error(error);
    });
  }


  render() {
    const sepMargin = {'marginBottom': '17px'};

    let nLinearFromk = (k, n, step) => { return Array.from(new Array(n), (x,i) => k+(i*(step))); }
    const temptRange = nLinearFromk(10, 30, 0.5);
    const illRange = nLinearFromk(0, 11, 100);
    const co2Range = nLinearFromk(100, 11, 100);
    return (
      <div className="section-wrapper section-center">
        <div className="mdc-card">
          <div className="card__primary">
            <MaterialSelect ref={this.pickedRoom} items={this.state.rooms} default='Pick a room' />
          </div>
          <div style={sepMargin} className="card__secondary mdc-typography--body2">
            <h3 className="noselect card__subtitle mdc-typography--subtitle2">Empty</h3>
            <div className="policy-key-value">
              <div className="noselect value-text-wrap"><span>Temperature min:</span></div>
              <MaterialSelect ref={this.emptyTmpMin} items={temptRange} default='°C' pattern='°C' />
            </div>
            <div className="noselect policy-key-value">
              <div className="noselect value-text-wrap"><span>Temperature max:</span></div>
              <MaterialSelect ref={this.emptyTmpMax} items={temptRange} default='°C' pattern='°C'/>
            </div>
          </div>
          <div style={sepMargin} className="card__secondary mdc-typography--body2">
            <h3 className="noselect noselect card__subtitle mdc-typography--subtitle2">Occupied</h3>
            <div className="policy-key-value">
              <div className="noselect value-text-wrap"><span>Temperature min:</span></div>
              <MaterialSelect ref={this.occTmpMin} items={temptRange} default='°C' pattern='°C'/>
            </div>
            <div className="policy-key-value">
              <div className="noselect value-text-wrap"><span>Temperature max:</span></div>
              <MaterialSelect ref={this.occTmpMax} items={temptRange} default='°C' pattern='°C'/>
            </div>
            <div className="policy-key-value">
              <div className="noselect value-text-wrap"><span>Min illuminance:</span></div>
              <MaterialSelect ref={this.occLxMin} items={illRange} default='lx' pattern='lx'/>
            </div>
            <div className="policy-key-value">
              <div className="noselect value-text-wrap"><span>Max CO2:</span></div>
              <MaterialSelect ref={this.occCo2Max} items={co2Range} default='ppm' pattern='ppm'/>
            </div>
          </div>
          <div className="mdc-card__actions">
            <div className="mdc-card__action-buttons">
              <button className="mdc-button mdc-card__action mdc-card__action--button" onClick={this.sendPolicy}>Save</button>
            </div>
          </div>
        </div>
      </div>
    )};
}
