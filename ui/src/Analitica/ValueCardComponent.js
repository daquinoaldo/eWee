import React from 'react';

import ChartCard from './ChartCardComponent';

export default class ValueCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: '',
      title: this.props.descriptor.title,
      subtitle: this.props.descriptor.subtitle,
      description: this.props.descriptor.description
    }
  }

  updateValue = (v) => {
    this.setState({ data: v });
  }

  render() {
    return (
      <div className="mdc-card value-card-wrapper">
        <div className="card__primary">
          <h2 className="card__title mdc-typography--headline6">
            {this.state.title}:&ensp;
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
