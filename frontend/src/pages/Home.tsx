import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Lightbulb,
  PlayCircle,
  Award,
  ArrowRight,
  Sparkles,
  BarChart3,
  Sliders,
  Thermometer,
  Droplets,
  Cpu,
  Wind,
  ShieldCheck,
  CheckCircle2
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
      <section className="relative rounded-3xl p-8 sm:p-12 border border-sky-100 bg-gradient-to-br from-white via-sky-50/40 to-teal-50/50 shadow-card overflow-hidden">
        {/* Soft Ambient Light Glows */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-teal-200/80 text-teal-800 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>MCA I Statistics Internal Assessment • Group 3</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Next-Hour Urban Air Quality{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
              Intelligence
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            A statistically validated time-series forecasting engine. We predict road-level Carbon Monoxide ground-truth concentrations (<code className="font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">CO_next</code>) one hour ahead using solid-state chemical telemetry and chronological gradient boosting with <strong className="text-slate-900 font-semibold">zero future data leakage</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all duration-200 shadow-md shadow-teal-600/25 hover:-translate-y-0.5 text-xs sm:text-sm"
            >
              <PlayCircle className="w-4 h-4 fill-white stroke-none" />
              <span>Launch Prediction Lab</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/insights"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-200 border border-slate-200 shadow-sm text-xs sm:text-sm"
            >
              <Lightbulb className="w-4 h-4 text-teal-600" />
              <span>Explore EDA Insights</span>
            </Link>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-200 border border-slate-200 shadow-sm text-xs sm:text-sm"
            >
              <Database className="w-4 h-4 text-sky-600" />
              <span>Browse Telemetry Data</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Sensor Telemetry Pods (Inspired by BreatheairMind & WeatherSwim) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Road Temp</div>
            <div className="text-lg font-bold text-slate-900 font-mono">18.3°C</div>
            <div className="text-[10px] text-slate-500">Annual Mean</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Humidity</div>
            <div className="text-lg font-bold text-slate-900 font-mono">48.9%</div>
            <div className="text-[10px] text-slate-500">Relative (RH)</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PT08.S1 Sensor</div>
            <div className="text-lg font-bold text-slate-900 font-mono">1,103 Ω</div>
            <div className="text-[10px] text-slate-500">Tin Oxide (CO)</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mean CO</div>
            <div className="text-lg font-bold text-slate-900 font-mono">2.09 mg</div>
            <div className="text-[10px] text-slate-500">Ground Truth</div>
          </div>
        </div>
      </section>

      {/* Real-Time Air Quality Gauge & Model Accuracy Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semi-Circular AQI Gauge Card (Inspired by BreatheairMind) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Atmospheric Station Telemetry</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Italian Urban Road Monitoring Station</h3>
              <p className="text-xs text-slate-500">March 2004 – April 2005 (Hourly Timeseries)</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active Network</span>
            </span>
          </div>

          {/* Semicircular Gauge Display */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-64 h-32 flex items-end justify-center">
              {/* Semi-Circle SVG Rainbow Gauge */}
              <svg className="w-64 h-32 overflow-visible" viewBox="0 0 200 100">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="35%" stopColor="#06b6d4" />
                    <stop offset="65%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
                {/* Background Track */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* Active Colored Arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="16"
                  strokeDasharray="251.2"
                  strokeDashoffset="125"
                  strokeLinecap="round"
                />
              </svg>

              {/* Central Readout inside Gauge */}
              <div className="absolute bottom-0 flex flex-col items-center text-center">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {loading ? '...' : data?.co_stats.mean}
                </span>
                <span className="text-xs font-medium text-slate-500">mg/m³ (Mean CO)</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Good Air Quality (Low Public Health Risk)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Hourly Records</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">9,353 hrs</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Station Median</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{data?.co_stats.median || '1.71'} mg</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Peak Surge</div>
              <div className="text-sm font-bold text-rose-600 font-mono mt-0.5">{data?.co_stats.max || '11.9'} mg</div>
            </div>
          </div>
        </div>

        {/* Model Accuracy & Goodness of Fit Pod */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Predictive Modelling Benchmark</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Tuned HistGradientBoosting Regressor</h3>
              <p className="text-xs text-slate-500">Validated on 1,403 chronological holdout test hours</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-1">
              <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Test Goodness of Fit</div>
              <div className="text-3xl sm:text-4xl font-black text-teal-900 font-mono tracking-tight">
                R² = {data?.primary_model.test_r2}
              </div>
              <div className="text-[11px] text-teal-700 font-medium">
                Explains 83.4% of next-hour variance
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-1">
              <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Accuracy Improvement</div>
              <div className="text-3xl sm:text-4xl font-black text-sky-900 font-mono tracking-tight">
                +{data?.primary_model.rmse_improvement_over_baseline_pct}%
              </div>
              <div className="text-[11px] text-sky-700 font-medium">
                RMSE reduction vs baseline
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Chronological Holdout Test RMSE</span>
              <span className="font-mono font-bold text-teal-800">{data?.primary_model.test_rmse} mg/m³</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: '83.4%' }}></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Naive Baseline: 0.7739 mg/m³</span>
              <span className="font-semibold text-teal-700">Tuned Model: 0.5378 mg/m³</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>5-Fold TimeSeriesSplit Cross-Validation</span>
            </span>
            <Link
              to="/evaluation"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View Full Benchmarks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Four-Stage Research Architecture Pipeline */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Scientific Research & Engineering Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              End-to-end transformation from raw solid-state semiconductor telemetry to validated machine learning inference.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 self-start sm:self-auto font-mono">
            Anti-Leakage Certified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5 hover:border-teal-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900">Ingestion & Sensor Audit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              9,353 hourly records parsed with European <code className="text-teal-700 font-mono">;</code> separator and <code className="text-teal-700 font-mono">,</code> decimals. Evaluated 5 metal-oxide chemical sensors alongside meteorological readings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5 hover:border-sky-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900">Sentinel Sanitization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identified hardware failure sentinels (<code className="text-rose-600 font-mono">-200</code>). Pruned <code className="font-mono text-slate-700">NMHC(GT)</code> (90.2% missing). Applied time-aware bounded linear interpolation with zero lookahead bias.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5 hover:border-indigo-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900">Autoregressive Engineering</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesized cyclical trigonometric traffic encodings (<code className="font-mono text-teal-700">hour_sin/cos</code>), autoregressive CO lags (1–3h), rolling moving averages, and sensor-to-pollutant cross-ratios.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5 hover:border-emerald-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900">Chronological Validation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict chronological partitioning (70% Train, 15% Val, 15% Test). Optimized hyperparameters across 5-fold <code className="font-mono text-teal-700">TimeSeriesSplit</code> to ensure absolute out-of-sample validity.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Exploration Matrix */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/predict"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-teal-300 hover:shadow-card-hover transition-all duration-200 group flex items-start gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Model Lab & What-If Simulator
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interact with our tuned HistGradientBoosting model. Drag sensor resistance, temperature, and humidity sliders to simulate live atmospheric next-hour forecasts with WHO health severity ratings.
            </p>
          </div>
        </Link>

        <Link
          to="/insights"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 hover:shadow-card-hover transition-all duration-200 group flex items-start gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                Empirical EDA & Traffic Rhythms
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore the bimodal traffic curve (8–9 AM & 6–8 PM commute waves), Sunday 35% emission dip, thermal inversion patterns, and semiconductor sensor correlation matrices.
            </p>
          </div>
        </Link>

        <Link
          to="/explore"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-card-hover transition-all duration-200 group flex items-start gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Cleaned Dataset & Hardware Sentinel Audit
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect the 9,353 cleaned hourly observations. Filter by split (Train, Val, Holdout Test), search timestamps, inspect variable definitions, or download the cleaned CSV.
            </p>
          </div>
        </Link>

        <Link
          to="/evaluation"
          className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-card-hover transition-all duration-200 group flex items-start gap-4 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Model Evaluation & Permutation Attribution
              </h3>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review comparative benchmarks (Baseline vs Linear vs Gradient Boosting), permutation feature importances, and residual error breakdowns across routine vs extreme pollution regimes.
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
};
