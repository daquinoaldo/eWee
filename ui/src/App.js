import React from 'react';
import {MDCRipple} from '@material/ripple';

import TitleBanner from './TitleBanner/TitleComponent';
import Analitica from './Analitica/AnaliticaSection';
import Management from './Management/ManagementSection';
import Policy from './Policy/PolicySection';
import Statistic from './Analitica/StatisticSection';
import Foot from './Foot/FootComponent';

// ----- ----- ROUTING ----- ----- //
import { BrowserRouter as Router, Route } from "react-router-dom";
import { AnimatedSwitch } from 'react-router-transition';

import './app.scss';

const UPDATE_PULSE = 1000;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.ManagementSection = React.createRef();
    this.AnaliticaSection = React.createRef();
    this.PolicySection = React.createRef();
    this.router = React.createRef();

    this.update = setInterval(this.update, UPDATE_PULSE);
  }

  update = () => {
    const currentRoute = this.router.current.history.location.pathname;
    if (currentRoute=='/management') this.ManagementSection.current.update();
    else if (currentRoute=='/policy') this.PolicySection.current.update();
    else if (currentRoute=='/statistics') {}
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
              <Route exac path="/policy" component={() => <Policy ref={this.PolicySection} />} />
              <Route exac path="/statistics" component={() => <Statistic ref={this.StatisticSection} />} />
              <Route path="/" component={() => <Analitica ref={this.AnaliticaSection} />} />
            </AnimatedSwitch>
          </div>
        </Router>
      </div>
    )
  };
}
