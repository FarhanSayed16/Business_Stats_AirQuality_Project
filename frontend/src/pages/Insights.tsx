import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Line, AreaChart, Area, BarChart, Bar, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, ReferenceArea, Brush, LabelList, Cell, ComposedChart
} from 'recharts';
import {
  Clock, Calendar, CloudSun, Layers, Activity, TrendingUp, ShieldAlert,
  Sparkles, SlidersHorizontal, Sun, Moon
} from 'lucide-react';
import { api } from '../api/client';
import type {
  HourlyPatternPoint, WeekdayPatternPoint, CorrelationData,
  WeatherScatterPoint, TimeseriesPoint
} from '../types';
import { ErrorState, GlassCard, LoadingState, coTier } from '../components/ui';

export const Insights: React.FC = () => {
  const [hourly, setHourly] = useState<HourlyPatternPoint[]>([]);
  const [weekday, setWeekday] = useState<WeekdayPatternPoint[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [weatherScatter, setWeatherScatter] = useState<WeatherScatterPoint[]>([]);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);
  const [selectedWeatherVar, setSelectedWeatherVar] = useState<'t' | 'rh' | 'ah'>('t');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time-series graph interactive controls
  const [timeRange, setTimeRange] = useState<'ALL' | '6M' | '3M' | '1M' | '7D'>('ALL');
  const [viewMode, setViewMode] = useState<'trend' | 'daily' | 'raw'>('trend');
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [showThreshold, setShowThreshold] = useState(true);
  const [showBrush, setShowBrush] = useState(true);

  // Enrich timeseries with centered moving averages (7-day and 24-hour)
  const enrichedTimeseries = useMemo(() => {
    if (!timeseries.length) return [];
    const N = timeseries.length;
    // Step is 6h -> 4 pts/day -> 7-day window is 28 pts, 24h window is 4 pts
    const W7 = 28;
    const W24 = 4;

    return timeseries.map((pt, i, arr) => {
      // 7-day centered rolling mean (macro seasonal trend)
      const s7 = Math.max(0, i - Math.floor(W7 / 2));
      const e7 = Math.min(N, i + Math.ceil(W7 / 2));
      let sum7 = 0;
      for (let j = s7; j < e7; j++) sum7 += arr[j].co;
      const co_rolling_7d = +(sum7 / (e7 - s7)).toFixed(2);

      // 24-hour centered rolling mean (daily wave)
      const s24 = Math.max(0, i - Math.floor(W24 / 2));
      const e24 = Math.min(N, i + Math.ceil(W24 / 2));
      let sum24 = 0;
      for (let j = s24; j < e24; j++) sum24 += arr[j].co;
      const co_rolling_24h = +(sum24 / (e24 - s24)).toFixed(2);

      return {
        ...pt,
        co_rolling_7d,
        co_rolling_24h,
        dateStr: String(pt.datetime).slice(0, 10),
        timeStr: String(pt.datetime).slice(11, 16)
      };
    });
  }, [timeseries]);

  // Filter based on selected time horizon
  const visibleTimeseries = useMemo(() => {
    if (!enrichedTimeseries.length || timeRange === 'ALL') return enrichedTimeseries;
    const lastItem = enrichedTimeseries[enrichedTimeseries.length - 1];
    const lastDate = new Date(String(lastItem.datetime).replace(' ', 'T'));
    const cutoff = new Date(lastDate);

    if (timeRange === '7D') cutoff.setDate(lastDate.getDate() - 7);
    else if (timeRange === '1M') cutoff.setDate(lastDate.getDate() - 30);
    else if (timeRange === '3M') cutoff.setDate(lastDate.getDate() - 90);
    else if (timeRange === '6M') cutoff.setDate(lastDate.getDate() - 180);

    const cutoffIso = cutoff.toISOString().slice(0, 19).replace('T', ' ');
    const subset = enrichedTimeseries.filter((p) => String(p.datetime) >= cutoffIso);
    return subset.length ? subset : enrichedTimeseries;
  }, [enrichedTimeseries, timeRange]);

  // Statistical KPIs for the currently visible window
  const windowStats = useMemo(() => {
    if (!visibleTimeseries.length) {
      return { mean: 0, peak: 0, peakDate: '', exceedPct: 0, count: 0 };
    }
    let sum = 0;
    let peak = -Infinity;
    let peakDate = '';
    let exceedCount = 0;

    for (const p of visibleTimeseries) {
      sum += p.co;
      if (p.co > peak) {
        peak = p.co;
        peakDate = String(p.datetime).slice(0, 10);
      }
      if (p.co >= 4.0) exceedCount++;
    }

    return {
      mean: +(sum / visibleTimeseries.length).toFixed(2),
      peak: +peak.toFixed(2),
      peakDate,
      exceedPct: +((exceedCount / visibleTimeseries.length) * 100).toFixed(1),
      count: visibleTimeseries.length
    };
  }, [visibleTimeseries]);

  const formatTimeseriesTick = useCallback((val: any) => {
    const s = String(val);
    try {
      const d = new Date(s.replace(' ', 'T'));
      if (isNaN(d.getTime())) return s.slice(0, 10);
      if (timeRange === '7D') {
        return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) + ` ${d.getHours()}:00`;
      }
      if (timeRange === '1M') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } catch {
      return s.slice(0, 10);
    }
  }, [timeRange]);

  // Diurnal hourly highlights (bimodal rush hour analysis)
  const hourlyStats = useMemo(() => {
    if (!hourly.length) {
      return { morningPeak: { hr: 9, mean: 2.78 }, eveningPeak: { hr: 19, mean: 3.48 }, nightLull: { hr: 5, mean: 0.90 } };
    }
    let morningPeak = { hr: 9, mean: -Infinity };
    let eveningPeak = { hr: 19, mean: -Infinity };
    let nightLull = { hr: 5, mean: Infinity };

    for (const p of hourly) {
      if (p.hour >= 7 && p.hour <= 11 && p.mean > morningPeak.mean) {
        morningPeak = { hr: p.hour, mean: p.mean };
      }
      if (p.hour >= 17 && p.hour <= 21 && p.mean > eveningPeak.mean) {
        eveningPeak = { hr: p.hour, mean: p.mean };
      }
      if (p.hour >= 2 && p.hour <= 6 && p.mean < nightLull.mean) {
        nightLull = { hr: p.hour, mean: p.mean };
      }
    }
    return { morningPeak, eveningPeak, nightLull };
  }, [hourly]);

  // Hourly dataset enriched with IQR tuples for Recharts range area
  const enrichedHourly = useMemo(() => {
    return hourly.map((d) => ({
      ...d,
      iqr: [d.q25, d.q75]
    }));
  }, [hourly]);

  // Weekday pattern metrics (workday commute vs Sunday lull)
  const weekdayStats = useMemo(() => {
    if (!weekday.length) return { avg: 2.10, workdayMean: 2.26, sundayMean: 1.52, sundayDropPct: 32.7 };
    const sum = weekday.reduce((acc, d) => acc + d.mean, 0);
    const avg = +(sum / weekday.length).toFixed(2);
    const workdays = weekday.filter((d) => d.day_of_week >= 0 && d.day_of_week <= 4);
    const workdayMean = +(workdays.reduce((acc, d) => acc + d.mean, 0) / (workdays.length || 1)).toFixed(2);
    const sunday = weekday.find((d) => d.day_name === 'Sunday');
    const sundayMean = sunday ? sunday.mean : 1.52;
    const sundayDropPct = +(((workdayMean - sundayMean) / workdayMean) * 100).toFixed(1);
    return { avg, workdayMean, sundayMean, sundayDropPct };
  }, [weekday]);

  // Weather scatter regression line and Pearson r
  const weatherStats = useMemo(() => {
    if (!weatherScatter.length) {
      return { r: 0, m: 0, b: 0, minX: 0, maxX: 1, meanX: 0, meanY: 0, trendY1: 0, trendY2: 0, count: 0, trendline: [] };
    }
    const key = selectedWeatherVar;
    const pts = weatherScatter
      .map((p) => ({ x: Number(p[key]), y: Number(p.co) }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));

    if (!pts.length) {
      return { r: 0, m: 0, b: 0, minX: 0, maxX: 1, meanX: 0, meanY: 0, trendY1: 0, trendY2: 0, count: 0, trendline: [] };
    }

    const n = pts.length;
    let sumX = 0;
    let sumY = 0;
    let minX = Infinity;
    let maxX = -Infinity;

    for (const p of pts) {
      sumX += p.x;
      sumY += p.y;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (const p of pts) {
      const dx = p.x - meanX;
      const dy = p.y - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const m = denX !== 0 ? num / denX : 0;
    const b = meanY - m * meanX;
    const r = denX !== 0 && denY !== 0 ? num / Math.sqrt(denX * denY) : 0;

    const trendY1 = +(m * minX + b).toFixed(2);
    const trendY2 = +(m * maxX + b).toFixed(2);
    const trendline = [
      { [key]: minX, trendCO: trendY1 },
      { [key]: maxX, trendCO: trendY2 }
    ];

    return {
      r: +r.toFixed(3),
      m: +m.toFixed(3),
      b: +b.toFixed(2),
      minX: Math.floor(minX),
      maxX: Math.ceil(maxX),
      meanX: +meanX.toFixed(1),
      meanY: +meanY.toFixed(2),
      trendY1,
      trendY2,
      count: n,
      trendline
    };
  }, [weatherScatter, selectedWeatherVar]);

  // Target CO feature correlations ranked by predictive strength
  const targetCorrelations = useMemo(() => {
    if (!correlation) return [];
    const coIdx = correlation.columns.indexOf('CO(GT)');
    if (coIdx === -1) return [];

    return correlation.columns
      .map((col, idx) => ({
        feature: col,
        shortName: col.replace('(GT)', '').replace('PT08.', ''),
        r: correlation.matrix[coIdx][idx]
      }))
      .filter((item) => item.feature !== 'CO(GT)')
      .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
  }, [correlation]);

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
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Insights — Atmospheric Patterns
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
          Diurnal commute waves, weekly lulls, weather coupling, and multi-pollutant correlations.
          For IQR outliers, normal-curve overlays, and empirical probabilities, use the{' '}
          <strong className="text-slate-800">Statistics</strong> tab.
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

      {/* Must-Have: Enhanced CO timeseries with multi-scale smoothing, range filtering, and advisory thresholds */}
      <GlassCard className="p-6 sm:p-8 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Carbon Monoxide Over Time
              </h3>
              <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-mono">
                {windowStats.count} points
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {viewMode === 'trend'
                ? 'Smoothed 7-day rolling trend with observed variance envelope and 4.0 mg/m³ advisory standard.'
                : viewMode === 'daily'
                ? '24-hour diurnal rolling mean tracking atmospheric day-night ventilation.'
                : 'High-resolution observed series (every 6th hour) with 3-hour rolling mean overlay.'}
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex flex-wrap items-center gap-1.5 glass-soft p-1.5 rounded-2xl border border-white/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Window:</span>
            {(['7D', '1M', '3M', '6M', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  timeRange === r
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {r === 'ALL' ? 'All (1Y)' : r}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode & Statistical KPI Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* View Mode Controls */}
          <div className="md:col-span-5 flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-xl glass-inner border border-white/50 text-xs font-medium">
              <button
                onClick={() => setViewMode('trend')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'trend' ? 'bg-white text-sky-800 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="7-Day Moving Average: Smooth macroscopic trendline"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                7D Trend
              </button>
              <button
                onClick={() => setViewMode('daily')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'daily' ? 'bg-white text-indigo-800 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="24-Hour Moving Average: Daily cycle without sub-daily noise"
              >
                24h Daily
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'raw' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Raw Observations & 3h Rolling Overlay"
              >
                Raw + 3h
              </button>
            </div>

            {/* Quick Toggle Controls */}
            <button
              onClick={() => setShowThreshold((v) => !v)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                showThreshold
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white'
              }`}
              title="Toggle 4.0 mg/m³ advisory standard line"
            >
              <ShieldAlert className="w-3 h-3 text-rose-500" />
              4 mg/m³ Standard
            </button>

            {viewMode !== 'raw' && (
              <button
                onClick={() => setShowEnvelope((v) => !v)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  showEnvelope
                    ? 'bg-sky-50 border-sky-200 text-sky-700'
                    : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white'
                }`}
                title="Toggle observed envelope behind trendline"
              >
                Envelope
              </button>
            )}

            <button
              onClick={() => setShowBrush((v) => !v)}
              className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                showBrush
                  ? 'bg-sky-50 border-sky-200 text-sky-700'
                  : 'bg-white/50 border-slate-200 text-slate-500 hover:bg-white'
              }`}
              title="Toggle interactive zoom & scrub slider"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Slider
            </button>
          </div>

          {/* KPI Summary Chips */}
          <div className="md:col-span-7 grid grid-cols-3 gap-2">
            <div className="glass-inner px-3 py-2 rounded-2xl border border-white/40 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Window Mean</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${windowStats.mean >= 4 ? 'bg-rose-500' : windowStats.mean >= 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span className="text-sm font-bold text-slate-900 font-mono">{windowStats.mean} mg/m³</span>
              </div>
            </div>

            <div className="glass-inner px-3 py-2 rounded-2xl border border-white/40 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Peak Exposure</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-rose-600 font-mono">{windowStats.peak} mg/m³</span>
                {windowStats.peakDate && (
                  <span className="text-[10px] text-slate-400 truncate">({windowStats.peakDate.slice(5)})</span>
                )}
              </div>
            </div>

            <div className="glass-inner px-3 py-2 rounded-2xl border border-white/40 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">&gt; 4.0 mg Standard</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-slate-800 font-mono">{windowStats.exceedPct}%</span>
                <span className="text-[10px] text-slate-400">of time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visibleTimeseries} margin={{ top: 10, right: 16, left: 0, bottom: showBrush ? 0 : 10 }}>
              <defs>
                <linearGradient id="coFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="indigoFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.20} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="datetime"
                tickFormatter={formatTimeseriesTick}
                minTickGap={35}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                unit=" mg"
                domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax, 4.5))]}
              />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (!active || !payload || !payload.length) return null;
                  const pt = payload[0].payload;
                  if (!pt) return null;
                  const tier = coTier(pt.co);

                  let displayDate = String(pt.datetime);
                  try {
                    const d = new Date(String(pt.datetime).replace(' ', 'T'));
                    displayDate =
                      d.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) + ` · ${String(d.getHours()).padStart(2, '0')}:00`;
                  } catch {}

                  return (
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3.5 shadow-xl min-w-[240px] text-xs space-y-2.5">
                      <div className="border-b border-slate-100 pb-2 flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800 text-[11px]">{displayDate}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.tone}`}>
                          {pt.co >= 4 ? 'Elevated' : pt.co >= 2 ? 'Moderate' : 'Good'}
                        </span>
                      </div>
                      <div className="space-y-1.5 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
                            Observed CO:
                          </span>
                          <span className="font-bold text-slate-900 font-mono text-sm">{pt.co.toFixed(2)} mg/m³</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                            7-Day Macro Trend:
                          </span>
                          <span className="font-semibold text-indigo-950 font-mono">{pt.co_rolling_7d.toFixed(2)} mg/m³</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                            3h Rolling Mean:
                          </span>
                          <span className="font-medium text-slate-700 font-mono">{pt.co_rolling_3h.toFixed(2)} mg/m³</span>
                        </div>
                        {pt.t !== undefined && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                            <span>Weather:</span>
                            <span className="font-mono text-slate-700 font-medium">{pt.t}°C · {pt.rh}% RH</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                iconType="circle"
              />

              {/* Threshold standard line */}
              {showThreshold && (
                <ReferenceLine
                  y={4.0}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Advisory Standard (4.0 mg/m³)',
                    position: 'insideTopRight',
                    fill: '#e11d48',
                    fontSize: 10,
                    fontWeight: 600
                  }}
                />
              )}

              {/* View Mode 1: Smooth 7-Day Macro Trend */}
              {viewMode === 'trend' && (
                <>
                  {showEnvelope && (
                    <Area
                      type="monotone"
                      dataKey="co"
                      stroke="#38bdf8"
                      strokeWidth={1}
                      strokeOpacity={0.35}
                      fill="url(#coFill)"
                      name="Observed Variation (Envelope)"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="co_rolling_7d"
                    stroke="#0284c7"
                    strokeWidth={2.75}
                    name="7-Day Rolling Trend"
                    dot={false}
                    activeDot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </>
              )}

              {/* View Mode 2: 24-Hour Diurnal Wave */}
              {viewMode === 'daily' && (
                <>
                  {showEnvelope && (
                    <Area
                      type="monotone"
                      dataKey="co"
                      stroke="#94a3b8"
                      strokeWidth={1}
                      strokeOpacity={0.25}
                      fill="url(#indigoFill)"
                      name="Observed Variation"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="co_rolling_24h"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    name="24h Rolling Mean"
                    dot={false}
                    activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </>
              )}

              {/* View Mode 3: High-Res Raw Series */}
              {viewMode === 'raw' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="co"
                    stroke="#0284c7"
                    fill="url(#coFill)"
                    strokeWidth={1.5}
                    name="Observed CO(GT)"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="co_rolling_3h"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    name="3h Rolling Mean"
                    dot={false}
                    isAnimationActive={false}
                  />
                </>
              )}

              {/* Interactive Scrub & Zoom Brush */}
              {showBrush && (
                <Brush
                  dataKey="datetime"
                  height={24}
                  stroke="#0284c7"
                  fill="#f8fafc"
                  tickFormatter={(v) => String(v).slice(0, 7)}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Contextual footnote explaining dataset characteristics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 border-t border-white/50 pt-3 gap-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>Winter thermal inversions (Nov–Jan) trap boundary-layer emissions, driving recurring peaks above 4.0 mg/m³.</span>
          </div>
          <span className="text-slate-400 italic">August 2004 plateau reflects sensor recalibration maintenance.</span>
        </div>
      </GlassCard>

      {/* 2. Diurnal Hourly Profile */}
      <GlassCard className="p-6 sm:p-8 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/40 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              Diurnal Hourly Profile (24-Hour Commute Signature)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bimodal rush-hour waves: Morning commute (8–9 AM) and evening peak (6–8 PM) with central 50% IQR ribbon.
            </p>
          </div>
          {/* Quick metric highlights */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="glass-soft px-3 py-1.5 rounded-xl border border-white/60 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-500">Morning Rush:</span>
              <span className="font-bold font-mono text-slate-800">{hourlyStats.morningPeak.mean.toFixed(2)} mg</span>
              <span className="text-[10px] text-slate-400">({hourlyStats.morningPeak.hr}:00)</span>
            </div>
            <div className="glass-soft px-3 py-1.5 rounded-xl border border-white/60 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-slate-500">Evening Peak:</span>
              <span className="font-bold font-mono text-rose-700">{hourlyStats.eveningPeak.mean.toFixed(2)} mg</span>
              <span className="text-[10px] text-slate-400">({hourlyStats.eveningPeak.hr}:00)</span>
            </div>
            <div className="glass-soft px-3 py-1.5 rounded-xl border border-white/60 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-500">Night Lull:</span>
              <span className="font-bold font-mono text-emerald-700">{hourlyStats.nightLull.mean.toFixed(2)} mg</span>
              <span className="text-[10px] text-slate-400">({hourlyStats.nightLull.hr}:00)</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={enrichedHourly} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="hourlyIqrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              {/* Commute Window Highlights */}
              <ReferenceArea x1={7} x2={10} fill="#fef3c7" fillOpacity={0.4} />
              <ReferenceArea x1={17} x2={20} fill="#e0e7ff" fillOpacity={0.4} />

              <XAxis dataKey="hour" tickFormatter={(hr) => `${hr}:00`} stroke="#64748b" fontSize={11} interval={1} />
              <YAxis stroke="#64748b" fontSize={11} unit=" mg" domain={[0, (dataMax) => Math.ceil(dataMax + 0.5)]} />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  const isMorning = d.hour >= 7 && d.hour <= 10;
                  const isEvening = d.hour >= 17 && d.hour <= 20;
                  const isNight = d.hour >= 2 && d.hour <= 6;
                  const period = isMorning ? 'Morning Commute' : isEvening ? 'Evening Rush Hour' : isNight ? 'Clean Night Baseline' : 'Midday Traffic';

                  return (
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3.5 shadow-xl text-xs space-y-2 min-w-[220px]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-bold text-slate-900">{d.hour}:00</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isMorning || isEvening ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-sky-50 text-sky-700'}`}>
                          {period}
                        </span>
                      </div>
                      <div className="space-y-1 font-sans">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mean CO:</span>
                          <span className="font-bold text-sky-800 font-mono">{d.mean.toFixed(2)} mg/m³</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Median:</span>
                          <span className="font-semibold text-slate-700 font-mono">{d.median.toFixed(2)} mg/m³</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                          <span>IQR Range (P25–P75):</span>
                          <span className="font-mono text-slate-700 font-medium">{d.q25.toFixed(2)} – {d.q75.toFixed(2)} mg</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="iqr" stroke="#38bdf8" strokeWidth={1} strokeDasharray="3 3" fill="url(#hourlyIqrFill)" name="Central 50% IQR (P25–P75)" dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="mean" stroke="#0284c7" strokeWidth={3} name="Mean CO" dot={{ r: 3.5, fill: '#0284c7', stroke: '#fff', strokeWidth: 1.5 }} activeDot={{ r: 6 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="median" stroke="#475569" strokeWidth={2} strokeDasharray="4 4" name="Median CO" dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-t border-white/50 pt-2.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300 inline-block" />
            <span>Yellow zone = Morning Rush (8–9 AM)</span>
            <span className="w-2.5 h-2.5 rounded bg-indigo-100 border border-indigo-300 inline-block ml-2" />
            <span>Purple zone = Evening Rush (6–8 PM)</span>
          </span>
          <span className="text-slate-400">Shaded ribbon marks central 50% interquartile range (P25 to P75).</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Day-of-Week Pattern */}
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/40 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                Day-of-Week Pattern (Commute vs Weekend)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weekly traffic rhythm: Sunday drops to {weekdayStats.sundayMean} mg/m³ ({weekdayStats.sundayDropPct}% below workday average).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-medium">
                Workdays: <strong>{weekdayStats.workdayMean} mg</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                Sunday: <strong>{weekdayStats.sundayMean} mg</strong>
              </span>
            </div>
          </div>
          <div className="h-68 w-full pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weekday} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day_name" stroke="#64748b" fontSize={11} tickFormatter={(d) => d.slice(0, 3)} />
                <YAxis stroke="#64748b" fontSize={11} unit=" mg" domain={[0, (dataMax) => Math.ceil(dataMax + 0.4)]} />
                <Tooltip
                  contentStyle={tipStyle}
                  formatter={(val: any) => [`${Number(val).toFixed(2)} mg/m³`, 'Mean CO']}
                  labelFormatter={(name) => `${name}`}
                />
                <ReferenceLine
                  y={weekdayStats.avg}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
                <Bar dataKey="mean" radius={[6, 6, 0, 0]} name="Mean CO" barSize={38} isAnimationActive={false}>
                  <LabelList
                    dataKey="mean"
                    position="top"
                    fill="#0f172a"
                    fontSize={11}
                    fontWeight={700}
                    offset={5}
                    formatter={(v: any) => `${Number(v).toFixed(2)}`}
                  />
                  {weekday.map((entry) => (
                    <Cell
                      key={entry.day_name}
                      fill={entry.day_name === 'Sunday' ? '#10b981' : entry.day_name === 'Saturday' ? '#0ea5e9' : '#0284c7'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-white/50 pt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sky-800 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-[#0284c7] inline-block" />
                Workdays (Mon–Fri)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-[#10b981] inline-block" />
                Sunday Lull (−{weekdayStats.sundayDropPct}%)
              </span>
            </div>
            <span className="text-slate-400">Dashed line = weekly overall mean ({weekdayStats.avg} mg/m³)</span>
          </div>
        </GlassCard>

        {/* 4. Weather vs CO */}
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/40 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-600" />
                Weather vs CO (Meteorological Coupling)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedWeatherVar === 't'
                  ? 'Temperature: Cold air promotes ground thermal inversions trapping vehicular emissions.'
                  : selectedWeatherVar === 'rh'
                  ? 'Humidity: Foggy, humid boundary layers reduce atmospheric vertical mixing.'
                  : 'Absolute humidity seasonal atmospheric water content.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-mono">
                r = {weatherStats.r}
              </span>
              <div className="flex items-center gap-1 glass-soft p-1 rounded-xl text-xs font-semibold">
                {(['t', 'rh', 'ah'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSelectedWeatherVar(k)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      selectedWeatherVar === k ? 'bg-white/90 text-sky-800 shadow-sm font-bold' : 'text-slate-600'
                    }`}
                  >
                    {k === 't' ? 'Temp (°C)' : k === 'rh' ? 'RH (%)' : 'AH'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="h-68 w-full pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={weatherScatter} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey={selectedWeatherVar}
                  stroke="#64748b"
                  fontSize={11}
                  domain={['auto', 'auto']}
                  unit={selectedWeatherVar === 't' ? '°C' : selectedWeatherVar === 'rh' ? '%' : ''}
                />
                <YAxis type="number" dataKey="co" stroke="#64748b" fontSize={11} unit=" mg" domain={[0, (dataMax) => Math.ceil(dataMax + 0.5)]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={tipStyle}
                  formatter={(val: any) => [`${val} mg/m³`, 'Observed CO']}
                  labelFormatter={(v) => `${selectedWeatherVar === 't' ? 'Temperature' : selectedWeatherVar === 'rh' ? 'Rel Humidity' : 'Abs Humidity'}: ${v}`}
                />
                <ReferenceLine
                  y={4.0}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'Advisory Standard (4.0 mg)', position: 'insideTopRight', fill: '#e11d48', fontSize: 10, fontWeight: 600 }}
                />
                {weatherStats.count > 0 && (
                  <ReferenceLine
                    segment={[
                      { x: weatherStats.minX, y: weatherStats.trendY1 },
                      { x: weatherStats.maxX, y: weatherStats.trendY2 }
                    ]}
                    stroke="#ea580c"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                )}
                <Scatter data={weatherScatter} fill="#0284c7" fillOpacity={0.4} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-white/50 pt-2">
            <div className="flex items-center gap-3">
              <span>800 sampled hours · Pearson r = <strong className="text-slate-800 font-mono">{weatherStats.r}</strong></span>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <span className="w-2.5 h-0.5 bg-[#ea580c] inline-block" />
                Orange line = Linear Fit
              </span>
            </div>
            <span className="text-slate-400">Points &gt; 4.0 mg represent high-exposure stagnation episodes</span>
          </div>
        </GlassCard>
      </div>

      {/* 5. Correlation Matrix */}
      {correlation && (
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/40 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                Feature Correlation Matrix (Pearson r)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Linear association between true CO and metal-oxide sensor resistances / meteorological variables.
              </p>
            </div>
            {/* Color key legend */}
            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block" /> ≥ 0.70 Strong
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-sky-100 border border-sky-300 inline-block" /> 0.40–0.70
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-50 border border-slate-200 inline-block" /> Neutral
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> ≤ −0.50 Inverse
              </span>
            </div>
          </div>

          {/* Target Spotlight Banner */}
          <div className="p-3.5 rounded-2xl glass-soft border border-white/60 space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>🎯 Target CO(GT) Predictive Hierarchy (Strongest Proxies):</span>
              <span className="text-[10px] text-slate-400 font-normal">Ranked by absolute Pearson |r|</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {targetCorrelations.slice(0, 5).map((item, idx) => (
                <div key={item.feature} className="p-2 rounded-xl glass-inner border border-white/50 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] font-bold text-sky-700">#{idx + 1}</span>
                    <span className="font-semibold text-slate-800 truncate" title={item.feature}>{item.shortName}</span>
                  </div>
                  <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${item.r >= 0.7 ? 'bg-sky-600 text-white' : item.r <= -0.5 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {item.r.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
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
