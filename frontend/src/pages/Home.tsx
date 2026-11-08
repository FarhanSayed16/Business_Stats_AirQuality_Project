import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database, Lightbulb, PlayCircle, Award, ArrowRight, Sparkles,
  BarChart3, Sliders, Thermometer, Droplets, Cpu, Wind, ShieldCheck
} from 'lucide-react';
import { api } from '../api/client';
import type { OverviewData } from '../types';
import { COGauge, ErrorState, GlassCard, LoadingState, SectionEyebrow } from '../components/ui';

export const Home: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getOverview()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load overview');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || undefined} onRetry={load} />;

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <div className="space-y-10 pb-12">
      <section className="relative rounded-[1.75rem] p-8 sm:p-12 glass-panel-strong overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-5">
          <SectionEyebrow>
            <Sparkles className="w-3.5 h-3.5 text-sky-700" />
            <span>MCA I Statistics Internal Assessment • Group 3</span>
          </SectionEyebrow>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 leading-[1.12] text-balance">
            AirWatch CO{' '}
            <span className="text-sky-700">
              Urban Atmospheric Intelligence
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
            Predict next-hour road-level Carbon Monoxide (
            <code className="font-mono text-sky-800 glass-soft px-1.5 py-0.5 rounded-lg">CO_next</code>
            ) from sensors and weather available up to the current hour — with chronological validation and zero future leakage.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all duration-200 shadow-md shadow-sky-600/25 hover:-translate-y-0.5 text-sm"
            >
              <PlayCircle className="w-4 h-4 fill-white stroke-none" />
              Launch Prediction Lab
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl glass-inner text-slate-700 font-semibold hover:bg-white/60 text-sm transition-all"
            >
              <Lightbulb className="w-4 h-4 text-sky-600" />
              Explore EDA Insights
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl glass-inner text-slate-700 font-semibold hover:bg-white/60 text-sm transition-all"
            >
              <Database className="w-4 h-4 text-sky-600" />
              Browse Telemetry
            </Link>
          </div>
        </div>
      </section>

      {/* Floating KPI pods — WeatherSwim / BreatheairMind inspired */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            icon: Thermometer,
            tone: 'text-slate-700',
            label: 'Road Temp',
            value: `${fmt(data.weather_stats.t_mean)}°C`,
            sub: 'Dataset mean T'
          },
          {
            icon: Droplets,
            tone: 'text-slate-600',
            label: 'Humidity',
            value: `${fmt(data.weather_stats.rh_mean)}%`,
            sub: 'Dataset mean RH'
          },
          {
            icon: Cpu,
            tone: 'text-sky-700',
            label: 'PT08.S1 Sensor',
            value: `${Math.round(data.sensor_stats.pt08_s1_mean).toLocaleString()} Ω`,
            sub: 'Tin oxide mean'
          },
          {
            icon: Wind,
            tone: 'text-sky-700',
            label: 'Mean CO',
            value: `${fmt(data.co_stats.mean)} mg`,
            sub: 'Ground truth mean'
          }
        ].map((pod) => {
          const Icon = pod.icon;
          return (
            <GlassCard
              key={pod.label}
              className="p-4 flex items-center gap-3.5 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-2xl glass-inner ${pod.tone} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{pod.label}</div>
                <div className="text-lg font-bold text-slate-900 font-mono">{pod.value}</div>
                <div className="text-[10px] text-slate-500">{pod.sub}</div>
              </div>
            </GlassCard>
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Station concentration gauge</span>
              <h3 className="text-lg font-display font-bold text-slate-900 mt-0.5">Italian Urban Road Monitor</h3>
              <p className="text-xs text-slate-500">
                {data.date_range.start.slice(0, 10)} → {data.date_range.end.slice(0, 10)} · {data.total_hours.toLocaleString()} hours
              </p>
            </div>
          </div>
          <COGauge value={data.co_stats.mean} />
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/40 text-center">
            <div className="p-2 rounded-xl glass-inner">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Hours</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{data.total_hours.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-xl glass-inner">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Median</div>
              <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">{data.co_stats.median} mg</div>
            </div>
            <div className="p-2 rounded-xl glass-inner">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Peak</div>
              <div className="text-sm font-bold text-rose-600 font-mono mt-0.5">{data.co_stats.max} mg</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-white/40 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">Champion model</span>
              <h3 className="text-lg font-display font-bold text-slate-900 mt-0.5">{data.primary_model.name}</h3>
              <p className="text-xs text-slate-500">Validated on chronological holdout hours</p>
            </div>
            <div className="w-10 h-10 rounded-xl glass-inner text-sky-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-inner space-y-1">
              <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Test R²</div>
              <div className="text-3xl font-black text-sky-900 font-mono tracking-tight">
                {data.primary_model.test_r2}
              </div>
              <div className="text-[11px] text-sky-700 font-medium">Holdout goodness of fit</div>
            </div>
            <div className="p-5 rounded-2xl glass-inner space-y-1">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">vs Baseline</div>
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                +{data.primary_model.rmse_improvement_over_baseline_pct}%
              </div>
              <div className="text-[11px] text-slate-600 font-medium">RMSE reduction</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-inner space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Holdout Test RMSE</span>
              <span className="font-mono font-bold text-sky-800">{data.primary_model.test_rmse} mg/m³</span>
            </div>
            <div className="w-full bg-white/40 rounded-full h-2 overflow-hidden border border-white/50">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, data.primary_model.test_r2 * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>MAE {data.primary_model.test_mae} mg/m³</span>
              <span className="font-semibold text-sky-700">MAE / RMSE from metrics.json</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              TimeSeriesSplit validated
            </span>
            <Link to="/evaluation" className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1">
              Full benchmarks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </GlassCard>
      </section>

      <GlassCard className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/40 pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-sky-600" />
              Research pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              From raw UCI telemetry to validated next-hour CO inference.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['01', 'Ingestion', 'European CSV parsing, 9,353 hourly records, sensors + weather.'],
            ['02', 'Sentinel clean', 'Replace −200, drop NMHC(GT), time-aware imputation.'],
            ['03', 'Features', 'Lags, rolling means, hour/month cycles — no future leakage.'],
            ['04', 'Validate', 'Chronological 70/15/15 + TimeSeriesSplit tuning.']
          ].map(([n, t, d]) => (
            <div key={n} className="p-5 rounded-2xl glass-inner space-y-2.5 hover:bg-white/55 transition-colors">
              <div className="w-8 h-8 rounded-lg glass-soft text-sky-800 flex items-center justify-center font-bold text-xs font-mono">{n}</div>
              <h3 className="text-sm font-bold text-slate-900">{t}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { to: '/predict', icon: Sliders, title: 'Model Lab', desc: 'Replay holdout hours or simulate custom scenarios for next-hour CO.', tone: 'sky' },
          { to: '/insights', icon: BarChart3, title: 'EDA Insights', desc: 'Diurnal peaks, weekday lull, weather coupling, correlation matrix.', tone: 'sky' },
          { to: '/explore', icon: Database, title: 'Dataset Explorer', desc: 'Filter cleaned rows, audit −200 missingness, download CSV.', tone: 'sky' },
          { to: '/evaluation', icon: Award, title: 'Evaluation', desc: 'Baseline vs linear vs trees — honest holdout diagnostics.', tone: 'sky' }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className="p-6 rounded-3xl glass-panel hover:bg-white/50 transition-all duration-200 group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl glass-inner text-sky-700 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{card.title}</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
};
