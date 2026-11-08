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
      <div className="min-h-screen flex flex-col bg-[#f4f7fb] text-slate-800 font-sans antialiased relative selection:bg-teal-100 selection:text-teal-900">
        {/* Soft Ambient Sky Light Gradient Cones */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[450px] bg-gradient-to-b from-sky-100/70 via-teal-50/40 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="fixed top-96 right-0 w-[500px] h-[500px] bg-emerald-50/50 blur-[140px] pointer-events-none -z-10" />

        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
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
