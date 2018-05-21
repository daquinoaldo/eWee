import React from 'react';


export default class AnaliticaSection extends React.Component {
  constructor(props) {
    super(props);
    this.switch = React.createRef();
  }

  render() {
    return (
      <div className="mdc-card value-card-wrapper">
        <div className="card__primary">
          <h2 className="card__title mdc-typography--headline6">
            Title
          </h2>
          <h3 className="card__subtitle mdc-typography--subtitle2">
            Subtitle
          </h3>
        </div>
        <div className="card__secondary mdc-typography--body2">
          description
        </div>
      </div>
  )};
}
