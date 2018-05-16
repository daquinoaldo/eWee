import React from 'react';

import ChartCard from './ChartCardComponent';

var tempt = {title: 'Temperature', subtitle: 'room 123', description:'abc'}

export default class AnaliticaSection extends React.Component {

  temperatureData = () => {
    return fetch('https://jsonplaceholder.typicode.com/posts/1')
  }

  render() {
    return (
      <div className="analitica_wrapper">
        <ChartCard url="cose" data={tempt} dataFetcher={this.temperatureData}/>
      </div>
  )};
}
