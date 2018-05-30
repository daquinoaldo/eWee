import React from 'react';

import {MDCDialog, MDCDialogFoundation, util} from '@material/dialog';

export default class Alert extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hidden: true,
    };
    this.dialog = React.createRef();
  }

  componentDidMount() {
    const dialog = new MDCDialog(this.dialog.current);
    dialog.show();
  }

  // ----- ----- USER ACTIONS ----- ----- //
  show = () => {
    this.setState({ hidden: false });
  };

  hide = () => {
    this.setState({ hidden: true });
  };

  render() {
    return (
      <div className="mask">
        <aside ref={this.dialog} id="my-mdc-dialog"
          className="mdc-dialog"
          role="alertdialog"
          aria-labelledby="my-mdc-dialog-label"
          aria-describedby="my-mdc-dialog-description">
          <div className="mdc-dialog__surface">
            <header className="mdc-dialog__header">
              <h2 id="my-mdc-dialog-label" className="mdc-dialog__header__title">
                Use Googles location service?
              </h2>
            </header>
            <section id="my-mdc-dialog-description" className="mdc-dialog__body">
              Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.
            </section>
            <footer className="mdc-dialog__footer">
              <button type="button" className="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--cancel">Decline</button>
              <button type="button" className="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept">Accept</button>
            </footer>
          </div>
          <div className="mdc-dialog__backdrop"></div>
        </aside>
      </div>
    )};
}
