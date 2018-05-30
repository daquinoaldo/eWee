import React from 'react';

import SensorChip from './SensorComponent';
import {MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';
import {MDCIconToggle} from '@material/icon-toggle';
import {MDCMenu} from '@material/menu';

import * as api from '../remoteApi.js';

export default class RoomManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editmode: false,
      roomname: props.roomname,
      roomid: props.roomid,
      unbounded: [122, 333],
      available: []
    };
    this.textfield = React.createRef();
    this.saveButton = React.createRef();
    this.editButton = React.createRef();
    this.sensorList = React.createRef();
    this.deleteButton = React.createRef();
    // this.clearIcon = React.createRef();
    this.menu = React.createRef();
  }

  componentDidMount() {
    this.getAvailable();

    this.iconToggle = new MDCIconToggle(this.editButton.current);
    // this.clearToggle = new MDCIconToggle(this.clearIcon.current);
    this.mdcTextfield = new MDCTextField(this.textfield.current);

    new MDCRipple(this.saveButton.current);
    // new MDCRipple(this.clearIcon.current);
    new MDCRipple(this.editButton.current);
    new MDCRipple(this.deleteButton.current);

    this.mdcTextfield.disabled = true;
    this.saveButton.current.disabled = true;
    this.deleteButton.current.disabled = true;

    this.mdcMenu = new MDCMenu(this.menu.current);
    this.getUnbounded();
  }

  remove = () => {
    let targetUrl = (api.url + '/home/room/' + this.state.roomid);
    api.send(targetUrl, 'DELETE', null, (res, error) => {
      if (!error)
        this.setState({ available: res.things ? res.things : [] });
    });
  };

  update = () => {
    // console.log(this.state.roomname);
    this.getAvailable();
  };


  // ----- ----- UPDATES ----- ----- //
  getAvailable = () => {
    const targetUrl = api.url+'/room/'+this.state.roomid;
    api.get(targetUrl, (res, error) => {
      if (!error)
        this.setState({ available: res.things ? res.things : [] });
    });
  };

  getUnbounded = () => {
    api.get(api.url+'/home', (res, error) => {
      if (!error)
        this.setState({ unbounded: res.unboundDevices });
      else console.log(error);
    });
  };


  // ----- ----- USER ACTIONS ----- ----- //
  openMenu = () => {
    this.mdcMenu.open = !this.menu.open;
  };

  bind = (mac) => {
    const targetUrl = api.url + '/room/' + this.state.roomid + '/device/' + mac;
    api.send(targetUrl, 'POST', null, (res, error) => {
      if (error) console.error(error);
      console.log(res);
    });
  };

  editMode = () => {
    let isEditing = !this.state.editmode;
    this.setState({editmode: isEditing});

    this.mdcTextfield.disabled = !isEditing;
    this.saveButton.current.disabled = !isEditing;
    this.deleteButton.current.disabled = !isEditing;
    this.iconToggle.on = isEditing;
    if (!isEditing) this.mdcTextfield.value = '';
  };

  save = () => {
    // Taking input value and discarding if there are no changes
    let actualValue = this.mdcTextfield.value;
    if (actualValue=='' || actualValue==this.state.roomname) {
      this.editMode();
      return;
    }
    // Updating room name and resetting to default mode
    this.setState({roomname: this.mdcTextfield.value}, () => this.editMode());
    // Sending the update
    let targetUrl = (api.url + '/home/room/' + this.state.roomid);
    api.send(targetUrl, 'POST', {'name': actualValue}, (res, error) => {
      if (error) console.error(error);
      console.log(res);
    });
  };

  // ----- ----- HTML RENDERERS ----- ----- //
  sensorsHtml = () => {
    const shtml = [];
    const bounded = this.state.available;
    const chipIcon = this.state.editmode ? 'clear' : 'default';
    for (var i = 0; i < bounded.length; i++) {
      shtml.push(
        <div className="flex-item" key={'sensor_'+i}>
          <SensorChip uuid={bounded[i]} icon={chipIcon} />
        </div>
      );
    }
    return shtml;
  };

  unmboundMenuHtml = () => {
    // Preparing the available sensors
    const shtml = [];
    const sensors = this.state.unbounded;
    for (let i=0; i < sensors.length; i++) {
      shtml.push(
        <li className="mdc-list-item" role="menuitem"
          tabIndex="0" key={i} onClick={() => this.bind(sensors[i])}>
          {sensors[i]}
        </li>
      );
    }
    return shtml;
  };


  render() {
    const textfieldvalue = this.state.editmode ? 'Room name' : this.state.roomname;
    return (
      <div className="room-management-wrapper">
        <div className="mdc-card room-card-wrapper">
          <i style={this.state.editmode ? {} : {opacity: 0}} className="remove-room material-icons mdc-card__action mdc-card__action--icon" tabIndex="0" role="button" title="Share" onClick={this.remove}>delete</i>
          <div className="card__primary">
          <div ref={this.textfield} className="mdc-text-field mdc-text-field--upgrade">
            <input type="text" id="tf-outlined" className="mdc-text-field__input" />
            <label htmlFor="tf-" className="mdc-floating-label">{textfieldvalue}</label>
          </div>
          </div>
          <div ref={this.sensorList} className="sensor-flex-wrapper">
            {this.sensorsHtml()}
          </div>
          <div className="mdc-card__actions">
            <div className="mdc-card__action-buttons">
              <button ref={this.saveButton} className="mdc-button mdc-card__action mdc-card__action--button" onClick={this.save}>Save</button>
              <div style={{position: 'relative'}}>
                <button ref={this.deleteButton} className="remove-button mdc-button mdc-card__action mdc-card__action--button" onClick={this.openMenu}>
                  Add
                </button>
                <div ref={this.menu} style={{position: 'absolute', left: '0'}} className="mdc-menu" tabIndex="-1">
                  <ul className="select-max-height mdc-menu__items mdc-list" role="menu" aria-hidden="true">
                    {this.unmboundMenuHtml()}
                  </ul>
                </div>
              </div>
            </div>
            <div className="mdc-card__action-icons">
              <i ref={this.editButton} className="mdc-icon-toggle material-icons mdc-card__action mdc-card__action--icon" role="button" aria-pressed="false"
               aria-label="Edit" tabIndex="0"
               role="button"
               data-toggle-on='{"label": "Remove from favorites", "content": "close"}'
               data-toggle-off='{"label": "Add to favorites", "content": "edit"}'
               onClick={this.editMode} />
            </div>
          </div>
        </div>
      </div>
  )};
}
