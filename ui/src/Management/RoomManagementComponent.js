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
  }

  componentDidMount() {
    new MDCRipple(this.saveButton.current);

    new MDCIconToggle(this.editButton.current);
    new MDCRipple(this.editButton.current);

    var mdcTextfield = new MDCTextField(this.textfield.current);
    mdcTextfield.disabled = true;
    this.setState({ availableSensors: available, textfield: mdcTextfield });
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
    this.state.textfield.disabled = cmode;
    this.saveButton.current.disabled = cmode;
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
              <button ref={this.saveButton} className="mdc-button mdc-card__action mdc-card__action--button">Save</button>
            </div>
            <div className="mdc-card__action-icons">
          <i ref={this.editButton} className="mdc-icon-toggle material-icons mdc-card__action mdc-card__action--icon" role="button" aria-pressed="false"
           aria-label="Add to favorites" tabIndex="0"
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
