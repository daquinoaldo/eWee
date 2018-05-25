import React from 'react';

import MaterialSelect from './MaterialSelectComponent';

import * as api from '../remoteApi.js';

export default class PolicySection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rooms: [],
    }
    this.menu = React.createRef();
    this.selection = React.createRef();
  }

  // ----- ----- LIFECYCLE HOOKS ----- ----- //
  update = () => {

  }

  componentDidMount() {
    const targetUrl = api.url+'/home';
    api.get(targetUrl, (res, error) => {
      if (!error)
        this.setState({ rooms: res.rooms });
      else console.error(error);
    });
  }


  // ----- ----- USER ACTIONS ----- ----- //
  openMenu = () => {
    this.mdcMenu.open = !this.menu.open;
  }

  render() {
    return (
      <div className="section-wrapper">
        <MaterialSelect items={this.state.rooms} default='Pick a room' />
      </div>
    )};
}
