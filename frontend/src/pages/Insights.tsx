import React, { useCallback, useEffect, useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Clock, Calendar, CloudSun, Layers, Sparkles, Activity, TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import type {
  HourlyPatternPoint, WeekdayPatternPoint, CorrelationData,
  WeatherScatterPoint, TimeseriesPoint
} from '../types';
import { ErrorState, GlassCard, LoadingState, SectionEyebrow } from '../components/ui';

export const Insights: React.FC = () => {
  const [hourly, setHourly] = useState<HourlyPatternPoint[]>([]);
  const [weekday, setWeekday] = useState<WeekdayPatternPoint[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [weatherScatter, setWeatherScatter] = useState<WeatherScatterPoint[]>([]);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [selectedWeatherVar, setSelectedWeatherVar] = useState<'t' | 'rh' | 'ah'>('t');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getHourlyPattern(),
      api.getWeekdayPattern(),
      api.getCorrelation(),
      api.getWeatherScatter(),
      api.getTimeseries(undefined, undefined, 6)
    ])
      .then(([hr, wk, corr, wsc, ts]) => {
        setHourly(hr);
        setWeekday(wk);
        setCorrelation(corr);
        setWeatherScatter(wsc);
        setTimeseries(ts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Building exploratory charts…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const tipStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(14,116,144,0.08)'
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <SectionEyebrow>
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Empirical statistical discoveries</span>
        </SectionEyebrow>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Exploratory Data Analysis & Atmospheric Rhythms
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Diurnal commute waves, weekly lulls, weather coupling, and multi-pollutant correlations from the cleaned UCI station series.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, title: 'Bimodal rush-hour', body: 'Peaks near 8–9 AM (~2.7) and 6–8 PM (~3.1 mg/m³).' },
          { icon: Calendar, title: 'Sunday lull', body: 'Weekend activity dips; Sunday mean near 1.54 mg/m³ (~35% lower).' },
          { icon: Layers, title: 'Sensor fidelity', body: 'PT08.S1 / PT08.S2 track reference CO with high Pearson correlation.' },
          { icon: CloudSun, title: 'Winter trapping', body: 'Cooler months show stronger accumulation patterns in street canyons.' }
        ].map((c) => {
          const Icon = c.icon;
          return (
            <GlassCard key={c.title} className="p-5 space-y-2 hover:shadow-card-hover transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{c.body}</p>
            </GlassCard>
          );
        })}
      </div>

      {/* Must-Have: full CO timeseries */}
      <GlassCard className="p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/40 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Carbon Monoxide Over Time
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Downsampled cleaned series (every 6th hour) with 3-hour rolling mean overlay.
            </p>
          </div>
          <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 font-mono">
            {timeseries.length} points
          </span>
        </div>
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeseries} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="coFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="datetime"
                tickFormatter={(v) => String(v).slice(0, 10)}
                minTickGap={40}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} unit=" mg" />
              <Tooltip
                contentStyle={tipStyle}
                labelFormatter={(v) => `Timestamp: ${v}`}
                formatter={(val: any, name: any) => [`${val} mg/m³`, name === 'co' ? 'CO(GT)' : '3h rolling']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="co" stroke="#0284c7" fill="url(#coFill)" strokeWidth={2} name="CO(GT)" dot={false} />
              <Line type="monotone" dataKey="co_rolling_3h" stroke="#64748b" strokeWidth={2} name="3h rolling" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-8 space-y-4">
        <div className="border-b border-white/40 pb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            Diurnal Hourly Profile
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Mean, median, and IQR by hour of day.</p>
        </div>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tickFormatter={(hr) => `${hr}:00`} stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} unit=" mg" />
              <Tooltip contentStyle={tipStyle} formatter={(val: any) => [`${val} mg/m³`, '']} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="mean" stroke="#0284c7" strokeWidth={3} name="Mean" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="median" stroke="#475569" strokeWidth={2} strokeDasharray="4 4" name="Median" dot={false} />
              <Line type="monotone" dataKey="q75" stroke="#94a3b8" strokeWidth={1} name="P75" dot={false} />
              <Line type="monotone" dataKey="q25" stroke="#cbd5e1" strokeWidth={1} name="P25" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="border-b border-white/40 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              Day-of-Week Pattern
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekday}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day_name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" mg" />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="mean" fill="#0284c7" radius={[6, 6, 0, 0]} name="Mean CO" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/40 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-amber-600" />
              Weather vs CO
            </h3>
            <div className="flex items-center gap-1 glass-soft p-1 rounded-xl text-xs font-semibold">
              {(['t', 'rh', 'ah'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedWeatherVar(k)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    selectedWeatherVar === k ? 'bg-white/90 text-sky-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {k === 't' ? 'Temp' : k === 'rh' ? 'RH' : 'AH'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey={selectedWeatherVar} stroke="#64748b" fontSize={11} name={selectedWeatherVar} />
                <YAxis type="number" dataKey="co" stroke="#64748b" fontSize={11} unit=" mg" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tipStyle} />
                <Scatter data={weatherScatter} fill="#0284c7" fillOpacity={0.4} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {correlation && (
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="border-b border-white/40 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              Correlation Matrix (Pearson r)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-[11px] font-mono">
              <thead>
                <tr>
                  <th className="py-2.5 px-3 text-left font-sans font-semibold text-slate-600">Feature</th>
                  {correlation.columns.map((c) => (
                    <th key={c} className="py-2.5 px-1 font-medium text-slate-600 truncate max-w-[70px]">
                      {c.replace('(GT)', '').replace('PT08.', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlation.columns.map((rowName, rIdx) => (
                  <tr key={rowName} className="border-t border-white/40">
                    <td className="py-2 px-3 text-left font-semibold text-slate-800 truncate max-w-[120px]">{rowName}</td>
                    {correlation.columns.map((_, cIdx) => {
                      const val = correlation.matrix[rIdx][cIdx];
                      const bg =
                        val >= 0.7
                          ? 'bg-sky-600 text-white font-bold'
                          : val >= 0.4
                          ? 'bg-sky-100 text-sky-900'
                          : val <= -0.5
                          ? 'bg-rose-500 text-white font-bold'
                          : val < 0
                          ? 'bg-rose-50 text-rose-800'
                          : 'bg-slate-50 text-slate-700';
                      return (
                        <td key={cIdx} className="p-1">
                          <span className={`block py-1 px-1 rounded-md text-[10px] ${bg}`}>{val.toFixed(2)}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
