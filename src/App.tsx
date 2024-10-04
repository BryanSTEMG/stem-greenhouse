import React from 'react';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import DonorLetter from './pages/DonorLetter/DonorLetter';

function App(): JSX.Element {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/donor-letter/*" element={<DonorLetter />} />
      </Routes>
    </Router>
  );
}

export default App;