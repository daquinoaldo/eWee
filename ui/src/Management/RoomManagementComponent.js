import React from 'react';

import SensorChip from './SensorComponent';
import AddSensorChip from './AddSensorComponent';
import {MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';
import {MDCIconToggle} from '@material/icon-toggle';

import * as api from '../remoteApi.js';

export default class RoomManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editmode: false,
      roomname: props.roomname,
      roomid: props.roomid,
      availableSensors: []
    }
    this.textfield = React.createRef();
    this.saveButton = React.createRef();
    this.editButton = React.createRef();
    this.sensorList = React.createRef();
    this.deleteButton = React.createRef();
  }

  componentDidMount() {
    this.iconToggle = new MDCIconToggle(this.editButton.current);
    this.mdcTextfield = new MDCTextField(this.textfield.current);

    new MDCRipple(this.saveButton.current);
    new MDCRipple(this.editButton.current);
    new MDCRipple(this.deleteButton.current);

    this.mdcTextfield.disabled = true;
    this.saveButton.current.disabled = true;
    this.deleteButton.current.disabled = true;

    this.updateTimer = setInterval(this.updateStatus, 1000);
  }

  componentWillUnmount () {
    clearInterval(this.updateTimer)
  }

  save = () => {
    let actualValue = this.mdcTextfield.value;
    if (actualValue=='' || actualValue==this.state.roomname) {
      this.editMode();
      return;
    };

    this.setState({roomname: this.mdcTextfield.value}, () => this.editMode());

    let postValue = (api.url + '/home/room/' + this.state.roomid);
    var options = { method: 'POST',
      headers: new Headers({
       'Content-Type': 'application/json',
       Accept: 'application/json',
      }),
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify({'name': actualValue})
    };
    fetch(postValue, options).then((res) => console.log(res));
  }

  remove = () => {
    let postValue = (api.url + '/home/room/' + this.state.roomid);
    var options = { method: 'DELETE',
      headers: new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      mode: 'cors',
      cache: 'default'
    };
    fetch(postValue, options).then((res) => console.log(res));
  }

  updateStatus = () => {
    fetch(api.url+'/room/'+this.state.roomid)
    .then(response => response.json())
    .then(json => {
      try {
        this.setState({ availableSensors: json.things ? json.things : [] });
      }
      catch (e) { console.log('abc') };
    });
  }

  sensorsHtml = () => {
    const shtml = [];
    const bounded = this.state.availableSensors;
    const chipIcon = this.state.editmode ? 'clear' : 'default';
    for (var i = 0; i < bounded.length; i++) {
      shtml.push(
        <div className="flex-item" key={'sensor_'+i}>
          <SensorChip uuid={bounded[i]} icon={chipIcon} />
        </div>
      );
    }
    return shtml;
  }

  newBindChip = () => {
    return (
      <div className="flex-item">
        <AddSensorChip roomid={this.state.roomid} />
      </div>
    );
  }

  editMode = () => {
    let isEditing = !this.state.editmode;
    this.setState({editmode: isEditing});

    this.mdcTextfield.disabled = !isEditing;
    this.saveButton.current.disabled = !isEditing;
    this.deleteButton.current.disabled = !isEditing;
    this.iconToggle.on = isEditing;
    if (!isEditing) this.mdcTextfield.value = '';
  }

  render() {
    const textfieldvalue = this.state.editmode ? 'Room name' : this.state.roomname
    let pluschip = (<div></div>);
    if (this.state.editmode) {
      pluschip = this.newBindChip();
    }
    return (
      <div className="room-management-wrapper">
        <div className="mdc-card value-card-wrapper">
          <div className="card__primary">
          <div ref={this.textfield} className="mdc-text-field mdc-text-field--upgrade">
            <input type="text" id="tf-outlined" className="mdc-text-field__input" />
            <label htmlFor="tf-" className="mdc-floating-label">{textfieldvalue}</label>
          </div>
          </div>
          <div ref={this.sensorList} className="sensor-flex-wrapper">
            {this.sensorsHtml()}
            {pluschip}
          </div>
          <div className="mdc-card__actions">
            <div className="mdc-card__action-buttons">
              <button ref={this.saveButton} className="mdc-button mdc-card__action mdc-card__action--button" onClick={this.save}>Save</button>
              <button ref={this.deleteButton} className="remove-button mdc-button mdc-card__action mdc-card__action--button" onClick={this.remove}>Remove</button>
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
