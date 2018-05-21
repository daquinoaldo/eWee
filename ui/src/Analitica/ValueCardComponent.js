import React from 'react';

import ChartCard from './ChartCardComponent';

export default class ValueCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: '',
      title: this.props.descriptor.title,
    }
    this._mount = false;
  }

  componentDidMount() {
    this._mount = true;
  }

  updateValue = (v) => {
    if (!this._mount) return;
    this.setState({ data: v });
  }

  render() {
    return (
      <div className="mdc-card value-card-wrapper">
        <div className="card__primary">
          <h3 className="card__subtitle mdc-typography--subtitle2">
            {this.state.title}:&ensp;
            <span className="highlight-value">{this.state.data}</span>
          </h3>
        </div>
      </div>
  )};
}
