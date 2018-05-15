import React from 'react';

import {MDCRipple} from '@material/ripple';

import TitleBanner from './TitleBanner/TitleComponent';
import ChartCard from './Analitica/ChartCardComponent';

import './app.scss';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      section: 'analitica'
    }
  }

  updateSection = (newSection) => {
    console.log(newSection);
    this.setState({ section: newSection })
  }

  render() {
    return(
      <div>
        <TitleBanner callback={this.updateSection}/>
        <div>
          <ChartCard url="cose"/>
        </div>
      </div>
    )
  };
}
