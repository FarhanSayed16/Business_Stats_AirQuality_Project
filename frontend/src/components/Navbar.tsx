import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Wind, BarChart3, Database, Lightbulb, PlayCircle, Award, Users, Menu, X, Activity } from 'lucide-react';
import { api } from '../api/client';

export const Navbar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkApi = async () => {
      try {
        await api.checkHealth();
        if (mounted) setIsOnline(true);
      } catch {
        if (mounted) setIsOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: BarChart3 },
    { name: 'Explore Data', path: '/explore', icon: Database },
    { name: 'Insights (EDA)', path: '/insights', icon: Lightbulb },
    { name: 'Predict Lab', path: '/predict', icon: PlayCircle },
    { name: 'Evaluation', path: '/evaluation', icon: Award },
    { name: 'Research Team', path: '/team', icon: Users },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="bg-[#0b1220]/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 px-4 sm:px-5 py-3 flex items-center justify-between">
        {/* Brand Identity */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/25 group-hover:scale-105 transition-transform duration-200">
            <Wind className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">AirWatch CO</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
                Group 3
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Urban Atmospheric Intelligence</p>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Status Indicator & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              isOnline === true
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : isOnline === false
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-slate-800/40 text-slate-400 border-slate-700/50'
            }`}
          >
            {isOnline === true ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-[11px] font-mono tracking-wide">API ONLINE</span>
              </>
            ) : isOnline === false ? (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                <span className="text-[11px] font-mono tracking-wide">API OFFLINE</span>
              </>
            ) : (
              <>
                <Activity className="w-3 h-3 animate-spin text-slate-400" />
                <span className="text-[11px] font-mono tracking-wide">CONNECTING</span>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-[#0b1220]/95 backdrop-blur-2xl border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-teal-400" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
