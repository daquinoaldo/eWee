import React from 'react';
import {MDCRipple} from '@material/ripple';

import TitleBanner from './TitleBanner/TitleComponent';
import Analitica from './Analitica/AnaliticaSection';
import Management from './Management/ManagementSection';
import Foot from './Foot/FootComponent';

// ----- ----- ROUTING ----- ----- //
import { BrowserRouter as Router, Route } from "react-router-dom";
import { AnimatedSwitch } from 'react-router-transition';

import './app.scss';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.ManagementSection = React.createRef();
    this.AnaliticaSection = React.createRef();
    this.router = React.createRef();

    this.update = setInterval(this.update, 1000);
  }

  update = () => {
    const currentRoute = this.router.current.history.location.pathname;
    if (currentRoute=='/management') this.ManagementSection.current.update();
    else this.AnaliticaSection.current.update();
  }

  render() {
    return(
      <div className="body-wrapper">
        <Router ref={this.router}>
          <div >
            <TitleBanner />
            <AnimatedSwitch
             atEnter={{ opacity: 0 }}
             atLeave={{ opacity: 0 }}
             atActive={{ opacity: 1 }}
             className="switch-wrapper"
            >
              <Route exac path="/management" component={() => <Management ref={this.ManagementSection} />} />
              <Route path="/" component={() => <Analitica ref={this.AnaliticaSection} />} />
            </AnimatedSwitch>
          </div>
        </Router>
      </div>
    )
  };
}
