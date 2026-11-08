import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Wind, BarChart3, Database, Lightbulb, PlayCircle, Award, Users, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api/client';

export const Navbar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

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
    const interval = setInterval(checkApi, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: 'Home', path: '/', icon: BarChart3 },
    { name: 'Explore Data', path: '/explore', icon: Database },
    { name: 'Insights (EDA)', path: '/insights', icon: Lightbulb },
    { name: 'Predict (Model Lab)', path: '/predict', icon: PlayCircle },
    { name: 'Evaluation', path: '/evaluation', icon: Award },
    { name: 'Team', path: '/team', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Title */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Wind className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">AirWatch CO</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Group 3
                </span>
              </div>
              <p className="text-xs text-slate-500">Air Quality & Pollution Intelligence</p>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-teal-600" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Health Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOnline === true
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isOnline === false
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {isOnline === true ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>API Live</span>
                </>
              ) : isOnline === false ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>API Offline</span>
                </>
              ) : (
                <span className="animate-pulse">Connecting...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
