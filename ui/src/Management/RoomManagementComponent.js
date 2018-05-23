import React from 'react';

import SensorChip from './SensorComponent';
import {MDCTextField} from '@material/textfield';
import {MDCRipple} from '@material/ripple';
import {MDCIconToggle} from '@material/icon-toggle';

var available = ["abc", "cde", "eee"];

export default class RoomManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editmode: false,
      roomname: props.roomname,
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
    this.setState({ availableSensors: available });
  }

  save = () => {
    console.log(this.mdcTextfield.value);
    this.setState({roomname: this.mdcTextfield.value}, () => this.editMode());
  }

  remove = () => {

  }

  sensorsHtml = () => {
    const shtml = [];
    const bounded = this.state.availableSensors;
    const chipIcon = this.state.editmode ? 'clear' : 'default';
    for (var i = 0; i<bounded.length; i++) {
      shtml.push(
        <div className="sensor-flex-item" key={'sensor_'+i}>
          <SensorChip uuid={bounded[i]} icon={chipIcon} />
        </div>
      );
    }
    return shtml;
  }

  editMode = () => {
    let cmode = this.state.editmode;
    this.setState({editmode: !cmode});
    this.mdcTextfield.disabled = cmode;
    this.saveButton.current.disabled = cmode;
    this.deleteButton.current.disabled = cmode;
    this.iconToggle.on = !cmode;
    if (!this.editmode) this.mdcTextfield.value = '';
  }

  render() {
    const textfieldvalue = this.state.editmode ? 'Room name' : this.state.roomname
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
