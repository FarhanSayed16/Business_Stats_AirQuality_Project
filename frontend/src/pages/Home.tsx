import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Database,
  Lightbulb,
  PlayCircle,
  Award,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import type { OverviewData } from '../types';

export const Home: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOverview()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
            MCA I Statistics Internal Assessment • Group 3
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            AirWatch CO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
              Air Quality & Pollution Intelligence
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Investigating 1-year hourly pollution dynamics from an urban Italian monitoring station (UCI Air Quality Dataset), uncovering diurnal rush-hour cycles, and forecasting <strong>next-hour Carbon Monoxide concentration</strong> using gradient-boosted time-series regression without temporal leakage.
          </p>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/25 text-sm"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Model Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors border border-white/15 text-sm"
            >
              <Lightbulb className="w-4 h-4 text-teal-400" />
              <span>View EDA Findings</span>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors border border-white/15 text-sm"
            >
              <Database className="w-4 h-4 text-sky-400" />
              <span>Explore Cleaned Data</span>
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Observations Analysed</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loading ? '...' : `${data?.total_hours.toLocaleString()} hrs`}
          </div>
          <p className="text-xs text-slate-500 mt-1">Mar 2004 – Apr 2005 (1 year)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Historical Mean CO</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {loading ? '...' : `${data?.co_stats.mean} mg/m³`}
          </div>
          <p className="text-xs text-slate-500 mt-1">Peak max: {data?.co_stats.max} mg/m³</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Test Goodness of Fit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {loading ? '...' : `R² = ${data?.primary_model.test_r2}`}
          </div>
          <p className="text-xs text-slate-500 mt-1">Test RMSE: {data?.primary_model.test_rmse} mg/m³</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Error Reduction</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {loading ? '...' : `+${data?.primary_model.rmse_improvement_over_baseline_pct}%`}
          </div>
          <p className="text-xs text-slate-500 mt-1">Improvement vs persistence baseline</p>
        </div>
      </section>

      {/* Project Workflow Architecture */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Dual-Layer Academic & Presentation Framework</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs">1</span>
              <span>1. Rigorous Data Cleansing</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filtered hardware sentinels (<code className="text-rose-600 font-mono">-200</code>), pruned <code className="text-slate-800 font-mono">NMHC(GT)</code> due to 90.2% missingness, and applied time-aware linear interpolation preserving hourly continuity.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-xs">2</span>
              <span>2. Time-Aware Forecasting</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Engineered autoregressive lags and cyclical solar transforms without data leakage. Chronological splits (70% Train, 15% Val, 15% Test) with <code className="font-mono text-slate-800">TimeSeriesSplit</code> tuning.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
              <span>3. Interactive Monitoring</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deployed serialised model artifacts into a decoupled FastAPI backend with interactive simulations, correlation analytics, and an audit of real-world usefulness and limitations.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/insights"
          className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              Exploratory Data Analysis (EDA)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Discover the bimodal rush-hour pollution cycle (8–9 AM & 6–8 PM), weekday vs weekend mobility variations, and meteorological dependencies on Temperature and Humidity.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 pt-4">
            <span>Explore Charts & Findings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/predict"
          className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
              Model Lab & Next-Hour Predictor
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Select any historical test-set observation or adjust weather and chemical sensor parameters to forecast next-hour carbon monoxide concentration live with real-time severity alerts.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 pt-4">
            <span>Open Prediction Studio</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>
    </div>
  );
};
