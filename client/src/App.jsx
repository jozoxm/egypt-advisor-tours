import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import EgyptianPhrases from './pages/EgyptianPhrases';
import EgyptianFood from './pages/EgyptianFood';
import TailorTrip from './pages/TailorTrip';
import About from './pages/About';
import Contact from './pages/Contact';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path='/' exact component={Home} />
        <Route path='/tours' component={Tours} />
        <Route path='/tours/:id' component={TourDetail} />
        <Route path='/egyptian-phrases' component={EgyptianPhrases} />
        <Route path='/egyptian-food' component={EgyptianFood} />
        <Route path='/tailor-trip' component={TailorTrip} />
        <Route path='/about' component={About} />
        <Route path='/contact' component={Contact} />
      </Switch>
    </Router>
  );
};

export default App;