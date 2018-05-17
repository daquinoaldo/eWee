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
      <div className="body-wrapper">
        <Router>
          <div >
            <TitleBanner />
            <AnimatedSwitch
             atEnter={{ opacity: 0 }}
             atLeave={{ opacity: 0 }}
             atActive={{ opacity: 1 }}
             className="switch-wrapper"
            >
              <Route exac path="/management" component={Management} />
              <Route path="/" component={Analitica} />
            </AnimatedSwitch>
          </div>
        </Router>
        <Foot />
      </div>
    )
  };
}
