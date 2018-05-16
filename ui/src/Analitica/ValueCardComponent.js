import React from 'react';

import ChartCard from './ChartCardComponent';

export default class ValueCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: '0',
      subtitle: this.props.data.subtitle,
      description: this.props.data.description
    }
  }

  render() {
    return (
      <div className="mdc-card wrapper">
        <div className="card__primary">
          <h2 className="card__title mdc-typography--headline6">
            Humidity:&ensp;
            <span className="highlight-value">{this.state.data}</span>
          </h2>
          <h3 className="card__subtitle mdc-typography--subtitle2">{this.state.subtitle}</h3>
        </div>
        <div className="card__secondary mdc-typography--body2">
          {this.state.description}
        </div>
      </div>
  )};
}
