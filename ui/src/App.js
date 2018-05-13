import React from 'react';

import {MDCRipple} from '@material/ripple';
import FloatingAction from './FloatingAction/FloatingAction';
import MaterialButton from './MaterialButton/MaterialButton';

import './app.scss';

export default class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <MaterialButton />
        <FloatingAction />
      </div>
    )
  };
}
