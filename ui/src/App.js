import React from 'react';
import {MDCRipple} from '@material/ripple';

import TitleBanner from './TitleBanner/TitleComponent';
import Analitica from './Analitica/AnaliticaSection';
import Management from './Management/ManagementSection';

// ----- ----- ROUTING ----- ----- //
import Router from 'react-router-dom/BrowserRouter';
import { AnimatedSwitch } from 'react-router-transition';
import Route from 'react-router-dom/Route';

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
        <TitleBanner />
        <Router>
         <AnimatedSwitch
           atEnter={{ opacity: 0 }}
           atLeave={{ opacity: 0 }}
           atActive={{ opacity: 1 }}
           className="switch-wrapper"
         >
           <Route exact path="/" component={Analitica} />
           <Route path="/management" component={Management}/>
         </AnimatedSwitch>
       </Router>
      </div>
    )
  };
}
