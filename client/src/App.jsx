import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import EgyptianPhrases from './pages/EgyptianPhrases';
import EgyptianFood from './pages/EgyptianFood';
import TailorTrip from './pages/TailorTrip';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/tours' element={<Tours />} />
        <Route path='/tours/:id' element={<TourDetail />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/egyptian-phrases' element={<EgyptianPhrases />} />
        <Route path='/egyptian-food' element={<EgyptianFood />} />
        <Route path='/tailor-trip' element={<TailorTrip />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;