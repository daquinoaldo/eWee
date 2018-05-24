import React from 'react';

import {MDCChipSet} from '@material/chips';
import {MDCRipple} from '@material/ripple';
import {MDCMenu} from '@material/menu';

import * as api from '../remoteApi.js';

export default class AddSensorChip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomid: props.roomid,
      available: []
    }
    this.sensorChip = React.createRef();
    this.menu = React.createRef();
  }


  // ----- ----- LIFECYCLE HOOKS ----- ----- //
  componentDidMount() {
    const chipSet = new MDCChipSet(this.sensorChip.current);
    MDCRipple.attachTo(this.sensorChip.current);

    this.mdcMenu = new MDCMenu(this.menu.current);
    this.loadAvailable();
  }


  // ----- ----- UPDATES ----- ----- //
  loadAvailable = () => {
    api.get(api.url+'/home', (res, error) => {
      if (!error)
        this.setState({ available: res.unboundDevices });
      else console.error(error);
    })
  }

  // ----- ----- USER ACTIONS ----- ----- //
  clickAction = () => {
    this.mdcMenu.open = !this.menu.open;
  }

  bind = (mac) => {
    const targetUrl = api.url + '/room/' + this.state.roomid + '/device/' + mac
    console.log(targetUrl);
    api.send(targetUrl, 'POST', null, (res, error) => {
      if (error) console.error(error);
      console.log(res);
    });
  }


  // ----- ----- HTML RENDERERS ----- ----- //
  unmboundMenuHtml = () => {
    // Preparing the available sensors
    const shtml = [];
    const sensors = this.state.available;
    for (let i=0; i < sensors.length; i++) {
      shtml.push(
        <li className="mdc-list-item" role="menuitem"
          tabIndex="0" key={i} onClick={() => this.bind(sensors[i])}>
          {sensors[i]}
        </li>
      );
    }
    return shtml;
  }

  render() {
    const iconClass = 'material-icons mdc-chip__icon mdc-chip__icon--leading sensor-chip-icon '

    return (
      <div onClick={this.clickAction}>
        <div ref={this.menu} className="mdc-menu" tabIndex="-1">
          <ul className="mdc-menu__items mdc-list" role="menu" aria-hidden="true">
            {this.unmboundMenuHtml()}
          </ul>
        </div>
        <div ref={this.sensorChip} className="mdc-chip">
          <div className="sensor-chip-wrapper">
            <i className='add-icon-correction material-icons mdc-chip__icon mdc-chip__icon--leading sensor-chip-icon'>add</i>
          </div>
        </div>
      </div>
  )};
}
