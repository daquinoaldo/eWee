import React from 'react';

import FloatingAction from '../FloatingAction/FloatingAction';

import {MDCTab, MDCTabFoundation} from '@material/tabs';
import {MDCTabBar, MDCTabBarFoundation} from '@material/tabs';


export default class Head extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionChangeCallback: props.callback
    }
    this.tab_bar = React.createRef();
    this.floatingAction = React.createRef();
  }

  componentDidMount() {
    const tabBar = new MDCTabBar(this.tab_bar.current);
  }

  sectionChange = (newSection) => {
    if (newSection=='Management') {
      this.floatingAction.current.riseUp()
    }
    else {
      this.floatingAction.current.collapse()
    }
    this.state.sectionChangeCallback(newSection);
  }

  render() {
    return (
      <div className="banner">
        <div className="vertical-wrapper">
          <h1>ESTIA<span>v0.1</span></h1>
          <nav ref={this.tab_bar} id="my-mdc-tab-bar" className="mdc-tab-bar nav-correction">
            <span className="mdc-tab mdc-tab--active" href="#one" onClick={() => this.sectionChange('Analitica')}>Analitica</span>
            <span className="mdc-tab" href="#two" onClick={() => this.sectionChange('Management')}>Management</span>
            <span className="mdc-tab-bar__indicator"></span>
          </nav>
        </div>
        <div className="bottom-right" style={this.state.floatingActionStyle}>
          <FloatingAction ref={this.floatingAction} className="bottom-right"/>
        </div>
      </div>
  )};
}
