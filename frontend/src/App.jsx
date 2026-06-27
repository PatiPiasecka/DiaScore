import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';
import ToastProvider from './components/ToastProvider';

function App() {

  return (
    <Router>
      <ToastProvider />
      <div className="min-h-screen bg-brand-plum">
        <Navbar />
        <main className="w-full pb-12">

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
