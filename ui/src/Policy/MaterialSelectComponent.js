import React from 'react';

import {MDCMenu} from '@material/menu';
import {MDCSelect} from '@material/select';

import * as api from '../remoteApi.js';

export default class PolicySection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [props.items],
      select: {name: props.default},
    }
    this.menu = React.createRef();
    this.selection = React.createRef();
  }

  // ----- ----- LIFECYCLE HOOKS ----- ----- //
  componentDidMount() {
    this.mdcSelection = new MDCSelect(this.selection.current);
    this.mdcMenu = new MDCMenu(this.menu.current);
  }

  componentWillReceiveProps = (props) => {
    this.setState({items: props.items});
  }


  // ----- ----- USER ACTIONS ----- ----- //
  openMenu = () => {
    this.mdcMenu.open = !this.menu.open;
  }

  getSelected = () => {

  }

  itemSelected = (item) => {
    this.setState({ select: item })
  }

  // ----- ----- HTML RENDERERS ----- ----- //
  itemMenuHtml = () => {
    const shtml = [];
    for (let i=0; i < this.state.items.length; i++) {
      const actualItem = this.state.items[i];
      shtml.push(
        <li className="mdc-list-item" role="menuitem"
          tabIndex="0" key={i} onClick={() => this.itemSelected(actualItem)}>
          {actualItem.name ? actualItem.name : actualItem}
        </li>
      );
    }
    return shtml;
  }

  render() {
    return (
      <div>
        <div style={{position: 'relative'}}>
          <div ref={this.selection} className="mdc-select" onClick={this.openMenu}>
            <select style={{'width': '150px'}} className="disable-select-app mdc-select__native-control">
              <option value="" disabled></option>
            </select>
            <label className="noselect mdc-floating-label">{this.state.select.name ? this.state.select.name : this.state.select}</label>
            <div className="mdc-line-ripple"></div>
          </div>
          <div ref={this.menu} style={{position: 'absolute', left: '0', top: '100%'}} className="mdc-menu" tabIndex="-1">
            <ul className="mdc-menu__items mdc-list select-max-height" role="menu" aria-hidden="true" style={{'minWidth': '200px'}}>
              {this.itemMenuHtml()}
            </ul>
          </div>
        </div>
      </div>
    )};
}
