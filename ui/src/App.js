import React from 'react';

import {MDCRipple} from '@material/ripple';

import TitleBanner from './TitleBanner/TitleComponent';

import './app.scss';

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <TitleBanner />
      </div>
    )
  };
}
