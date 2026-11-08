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
      <div className="glass-panel-strong rounded-3xl px-4 sm:px-5 py-3 flex items-center justify-between">
        {/* Brand Identity */}
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white group-hover:bg-sky-700 transition-colors duration-200 shadow-lg shadow-sky-600/25">
            <Wind className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">AirWatch CO</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full glass-soft text-sky-800">
                Group 3
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Urban Atmospheric Intelligence</p>
          </div>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 glass-soft p-1 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white/90 text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
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
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium glass-soft transition-colors ${
              isOnline === true
                ? 'text-sky-700'
                : isOnline === false
                ? 'text-rose-700'
                : 'text-slate-600'
            }`}
          >
            {isOnline === true ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span className="text-[11px] font-mono tracking-wide">API ACTIVE</span>
              </>
            ) : isOnline === false ? (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span className="text-[11px] font-mono tracking-wide">API OFFLINE</span>
              </>
            ) : (
              <>
                <Activity className="w-3 h-3 animate-spin text-slate-500" />
                <span className="text-[11px] font-mono tracking-wide">CONNECTING</span>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl glass-soft text-slate-700 hover:bg-white/50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 glass-panel-strong rounded-3xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
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
                      ? 'bg-white/80 text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:bg-white/40'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-sky-600" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};
