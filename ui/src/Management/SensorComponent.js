import React from 'react';

import {MDCChipSet} from '@material/chips';
import {MDCRipple} from '@material/ripple';

const url = 'https://api.p1.aldodaquino.com'

export default class SensorChip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: props.uuid,
      blinking: false,
      remove: (this.props.remove ? this.props.remove: false),
    }
    this.sensorChip = React.createRef();
  }

  componentDidMount() {
    const chipSet = new MDCChipSet(this.sensorChip.current);
    MDCRipple.attachTo(this.sensorChip.current);
  }

  sendPost = () => {
    let postValue = (url + '/actuator/' + this.state.uuid);
    postValue += '/0003';
    var options = { method: 'POST',
     headers: new Headers(),
     mode: 'cors',
     cache: 'default',
     body: JSON.stringify({'value': 'on'})
    };
    fetch(postValue, options).then((res) => console.log(res));
  }

  componentWillReceiveProps = (props) => {
    this.setState({remove: props.remove});
  }

  blink = () => {
    if (this.state.remove) return;

    this.sendPost();
    const target = url + '/' + this.state.uuid
    for (let i=0; i<6; i++) {
      setTimeout(() => {
        this.setState({ blinking:  !this.state.blinking })
      }, i*500);
    }
  }

  render() {
    const currentIcon = this.state.remove ? 'clear' : 'radio_button_unchecked'
    const basicClass = 'inner-radio material-icons mdc-chip__icon mdc-chip__icon--leading sensor-chip-icon';
    const checkedClass = basicClass + (this.state.blinking ? ' sensor-chip-visible' : '');
    return (
      <div ref={this.sensorChip} className="mdc-chip">
        <div className={checkedClass} onClick={this.blink}></div>
        <i className="material-icons mdc-chip__icon mdc-chip__icon--leading">{currentIcon}</i>
        <div className="mdc-chip__text">{this.state.uuid}</div>

      </div>
  )};
}
