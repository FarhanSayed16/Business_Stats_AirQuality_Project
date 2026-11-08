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
  ArrowRight,
  Layers,
  Sparkles,
  BarChart3,
  Sliders
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
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl p-8 sm:p-12 border border-slate-800/80 bg-gradient-to-br from-[#0c1424] via-[#090e1a] to-[#071318] shadow-2xl shadow-black/60 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>MCA I Statistics Internal Assessment • Group 3</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Next-Hour Urban Air Quality{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-cyan-400">
              Intelligence
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            A statistically rigorous time-series forecasting engine. We predict road-level Carbon Monoxide concentrations (<code className="font-mono text-teal-300 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800/50">CO_next</code>) one hour ahead using semiconductor telemetry, chronological partitioning, and tuned gradient boosting with <strong className="text-white">zero future data leakage</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-slate-950 font-bold hover:from-teal-400 hover:to-teal-300 transition-all duration-200 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 text-xs sm:text-sm"
            >
              <PlayCircle className="w-4 h-4 fill-slate-950 stroke-none" />
              <span>Launch Prediction Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/insights"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold transition-all duration-200 border border-slate-700/80 text-xs sm:text-sm"
            >
              <Lightbulb className="w-4 h-4 text-teal-400" />
              <span>Explore EDA Insights</span>
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold transition-all duration-200 border border-slate-700/80 text-xs sm:text-sm"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Browse Telemetry Data</span>
            </Link>
          </div>
        </div>
      </section>

      {/* High-Impact Telemetry Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hours */}
        <div className="bg-[#0b1220]/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Observations</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {loading ? '...' : `${data?.total_hours.toLocaleString()}`}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span>Mar 2004 – Apr 2005 (Hourly Series)</span>
          </p>
        </div>

        {/* Card 2: Mean CO */}
        <div className="bg-[#0b1220]/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Historical Mean CO</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {loading ? '...' : `${data?.co_stats.mean} `}
            <span className="text-sm font-normal text-slate-400 font-sans">mg/m³</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>Peak: {data?.co_stats.max || '11.9'} mg/m³ • Median: {data?.co_stats.median || '1.71'}</span>
          </p>
        </div>

        {/* Card 3: Model Fit R² */}
        <div className="bg-[#0b1220]/70 backdrop-blur-md p-6 rounded-2xl border border-teal-500/30 shadow-xl shadow-teal-500/5 hover:border-teal-500/50 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300">Champion Test Fit</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-teal-300 font-mono tracking-tight">
            {loading ? '...' : `R² = ${data?.primary_model.test_r2}`}
          </div>
          <p className="text-xs text-teal-200/70 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span>Test RMSE: {data?.primary_model.test_rmse} mg/m³</span>
          </p>
        </div>

        {/* Card 4: Error Reduction */}
        <div className="bg-[#0b1220]/70 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Accuracy Gain</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {loading ? '...' : `+${data?.primary_model.rmse_improvement_over_baseline_pct}%`}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>RMSE cut vs persistence baseline</span>
          </p>
        </div>
      </section>

      {/* Four-Stage Research Architecture Pipeline */}
      <section className="bg-[#0b1220]/60 backdrop-blur-md rounded-3xl p-8 border border-slate-800/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-teal-400" />
              <span>Scientific Research & Engineering Pipeline</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              End-to-end transformation from raw solid-state semiconductor telemetry to validated machine learning inference.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 self-start sm:self-auto font-mono">
            Anti-Leakage Certified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/70 hover:border-teal-500/30 transition-all duration-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h3 className="text-sm font-bold text-white">Ingestion & Sensor Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              9,353 hourly records parsed with European <code className="text-teal-300 font-mono">;</code> separator and <code className="text-teal-300 font-mono">,</code> decimals. Evaluated 5 metal-oxide chemical sensors alongside meteorological readings.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/70 hover:border-teal-500/30 transition-all duration-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h3 className="text-sm font-bold text-white">Sentinel Sanitization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identified hardware failure sentinels (<code className="text-rose-400 font-mono">-200</code>). Pruned <code className="font-mono text-slate-300">NMHC(GT)</code> (90.2% missing). Applied time-aware bounded linear interpolation with zero lookahead bias.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/70 hover:border-teal-500/30 transition-all duration-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h3 className="text-sm font-bold text-white">Autoregressive Engineering</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesized cyclical trigonometric traffic encodings (<code className="font-mono text-teal-300">hour_sin/cos</code>), autoregressive CO lags (1–3h), rolling moving averages, and sensor-to-pollutant cross-ratios.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/70 hover:border-teal-500/30 transition-all duration-200 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono">
              04
            </div>
            <h3 className="text-sm font-bold text-white">Chronological Validation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict chronological partitioning (70% Train, 15% Val, 15% Test). Optimized hyperparameters across 5-fold <code className="font-mono text-teal-300">TimeSeriesSplit</code> to ensure absolute out-of-sample validity.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Exploration Matrix */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/predict"
          className="p-6 rounded-3xl bg-[#0b1220]/70 border border-slate-800/80 hover:border-teal-500/40 hover:bg-slate-900/70 transition-all duration-200 group flex items-start gap-4 shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                Model Lab & What-If Simulator
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interact with our tuned HistGradientBoosting model. Drag sensor resistance, temperature, and humidity sliders to simulate live atmospheric next-hour forecasts with WHO health severity ratings.
            </p>
          </div>
        </Link>

        <Link
          to="/insights"
          className="p-6 rounded-3xl bg-[#0b1220]/70 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/70 transition-all duration-200 group flex items-start gap-4 shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Empirical EDA & Traffic Rhythms
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore the bimodal traffic curve (8–9 AM & 6–8 PM commute waves), Sunday 35% emission dip, thermal inversion patterns, and semiconductor sensor correlation matrices.
            </p>
          </div>
        </Link>

        <Link
          to="/explore"
          className="p-6 rounded-3xl bg-[#0b1220]/70 border border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-900/70 transition-all duration-200 group flex items-start gap-4 shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                Cleaned Dataset & Hardware Sentinel Audit
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect the 9,353 cleaned hourly observations. Filter by split (Train, Val, Holdout Test), search timestamps, inspect variable definitions, or download the cleaned CSV.
            </p>
          </div>
        </Link>

        <Link
          to="/evaluation"
          className="p-6 rounded-3xl bg-[#0b1220]/70 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/70 transition-all duration-200 group flex items-start gap-4 shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                Model Evaluation & Permutation Attribution
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review comparative benchmarks (Baseline vs Linear vs Gradient Boosting), permutation feature importances, and residual error breakdowns across routine vs extreme pollution regimes.
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
};
