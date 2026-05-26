import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import History from './pages/History';

function App() {
  const [activeTab, setActiveTab] = useState('analiza');

  return (
    <Router>
      <div className="min-h-screen bg-brand-plum">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab}/>
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
