import React from 'react';

import MaterialSelect from './MaterialSelectComponent';

import * as api from '../remoteApi.js';

export default class PolicySection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rooms: [],
    }
    this.menu = React.createRef();
    this.selection = React.createRef();
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

  render() {
    const sepMargin = {'marginBottom': '17px'};

    let nLinearFromk = (k, n, s) => { return Array.from(new Array(n), (x,i) => k+i+s); }
    const temptRange = nLinearFromk(20, 30, ' °C');
    const illRange = nLinearFromk(20, 30, ' lx');
    const co2Range = nLinearFromk(20, 30, ' ppm');
    return (
      <div className="section-wrapper section-center">
        <div className="mdc-card">
          <div className="card__primary">
            <MaterialSelect items={this.state.rooms} default='Pick a room' />
          </div>
          <div style={sepMargin} className="card__secondary mdc-typography--body2">
            <h3 className="noselect card__subtitle mdc-typography--subtitle2">Empty</h3>
            <div className="policy-key-value">
              <div className="noselect value-text-wrap"><span>Temperature min:</span></div>
              <MaterialSelect items={temptRange} default='°C' />
            </div>
            <div className="noselect policy-key-value">
              <div className="noselect value-text-wrap"><span>Temperature max:</span></div>
              <MaterialSelect items={temptRange} default='°C' />
            </div>
          </div>
          <div style={sepMargin} className="card__secondary mdc-typography--body2">
            <h3 className="noselect card__subtitle mdc-typography--subtitle2">Occupied</h3>
            <div className="policy-key-value">
              <div className="value-text-wrap"><span>Temperature min:</span></div>
              <MaterialSelect items={temptRange} default='°C' />
            </div>
            <div className="policy-key-value">
              <div className="value-text-wrap"><span>Temperature max:</span></div>
              <MaterialSelect items={temptRange} default='°C' />
            </div>
            <div className="policy-key-value">
              <div className="value-text-wrap"><span>Min illuminance:</span></div>
              <MaterialSelect items={illRange} default='lx' />
            </div>
            <div className="policy-key-value">
              <div className="value-text-wrap"><span>Max CO2:</span></div>
              <MaterialSelect items={co2Range} default='ppm' />
            </div>
          </div>
          <div className="mdc-card__actions">
            <div className="mdc-card__action-buttons">
              <button className="mdc-button mdc-card__action mdc-card__action--button">Save</button>
            </div>
          </div>
        </div>

      </div>
    )};
}
