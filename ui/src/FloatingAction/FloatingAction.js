import React from 'react';
import {MDCRipple} from '@material/ripple';

export default class FloatingAction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHidden: 'scale-to-zero'
    }
    this.actionButton = React.createRef();
  }

  componentDidMount() {
    MDCRipple.attachTo(this.actionButton.current);
  }

  collapse = () => {
    this.setState({
      isHidden: 'scale-to-zero'
    })
  }

  riseUp = () => {
    this.setState({
      isHidden: ''
    })
  }

  render() {
    const wrapperClasses = "white-margin absolute-center " + this.state.isHidden;
    return (
      <div className={wrapperClasses}>
        <button ref={this.actionButton} className="mybutton mdc-fab material-icons" aria-label="Favorite">
          <span className="mdc-fab__icon">
            add
          </span>
        </button>
      </div>
  )};
}
