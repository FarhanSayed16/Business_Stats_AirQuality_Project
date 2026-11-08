import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Insights } from './pages/Insights';
import { Predict } from './pages/Predict';
import { Evaluation } from './pages/Evaluation';
import { Team } from './pages/Team';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col text-slate-800 font-sans antialiased relative selection:bg-sky-100 selection:text-sky-900">
        {/* Atmosphere background from generated scenic sky image */}
        <div
          className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg-atmosphere.png')" }}
          aria-hidden
        />
        {/* Soft wash — keep atmosphere visible through frosted panels */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-sky-100/25 via-transparent to-sky-200/30"
          aria-hidden
        />

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 animate-fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/team" element={<Team />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
