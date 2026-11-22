import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, Line, ComposedChart, Area, AreaChart, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import {
  Workflow, Brush, BoxSelect, Activity, Percent, FlaskConical, CheckCircle2, Award,
  Info, ShieldAlert, Eye, Layers
} from 'lucide-react';
import { api } from '../api/client';
import type {
  DistributionData, OutlierData, ProbabilitiesData, MethodsSummary, MissingnessItem
} from '../types';
import { ErrorState, GlassCard, LoadingState } from '../components/ui';

const tipStyle = {
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderRadius: '12px',
  border: '1px solid rgba(226,232,240,0.95)',
  color: '#0f172a',
  fontSize: '12px',
  boxShadow: '0 10px 28px rgba(15,23,42,0.08)'
};

const shortModelName: Record<string, string> = {
  Persistence_Baseline: 'Persistence',
  Linear_Regression: 'Linear',
  Ridge_Regression: 'Ridge',
  Random_Forest: 'Random Forest',
  Tuned_HistGradientBoosting: 'HGB (champ)'
};

export const Statistics: React.FC = () => {
  const [variable, setVariable] = useState('CO(GT)');
  const [distribution, setDistribution] = useState<DistributionData | null>(null);
  const [outliers, setOutliers] = useState<OutlierData | null>(null);
  const [outlierViewMode, setOutlierViewMode] = useState<'boxplot' | 'distribution' | 'inspector'>('boxplot');
  const [probabilities, setProbabilities] = useState<ProbabilitiesData | null>(null);
  const [methods, setMethods] = useState<MethodsSummary | null>(null);
  const [missingness, setMissingness] = useState<MissingnessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getDistribution(variable, 30),
      api.getOutliers(variable),
      api.getProbabilities(),
      api.getMethodsSummary(),
      api.getMissingness()
    ])
      .then(([dist, out, probs, meth, miss]) => {
        setDistribution(dist);
        setOutliers(out);
        setProbabilities(probs);
        setMethods(meth);
        setMissingness(miss);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
        setLoading(false);
      });
  }, [variable]);

  useEffect(() => {
    load();
  }, [load]);

  const histChart = useMemo(() => {
    if (!distribution) return [];
    const curve = distribution.normal_curve;
    return distribution.histogram.map((h) => {
      let normalY = 0;
      if (curve.length) {
        let best = curve[0];
        let bestDist = Math.abs(best.x - h.bin_center);
        for (const p of curve) {
          const d = Math.abs(p.x - h.bin_center);
          if (d < bestDist) {
            best = p;
            bestDist = d;
          }
        }
        normalY = best.y;
      }
      return {
        x: Number(h.bin_center.toFixed(2)),
        count: h.count,
        normal: Number(normalY.toFixed(2))
      };
    });
  }, [distribution]);

  // Geometric coordinates for true horizontal Tukey Box Plot
  const boxplotGeometry = useMemo(() => {
    if (!outliers) return null;
    const { q1, median, q3, iqr, lower_fence: lowerFence, upper_fence: upperFence } = outliers;
    const obsMin = distribution ? distribution.min : Math.max(0, lowerFence);
    const obsMax = distribution ? distribution.max : Math.max(upperFence + 2, 12);

    const minX = lowerFence < 0 ? Math.floor(lowerFence) - 0.5 : 0;
    const maxX = Math.ceil(Math.max(obsMax, upperFence) + 1);
    const span = Math.max(1, maxX - minX);

    const getPct = (val: number) => {
      const clamped = Math.max(minX, Math.min(maxX, val));
      return ((clamped - minX) / span) * 100;
    };

    const whiskerLeft = Math.max(obsMin, lowerFence);
    const whiskerRight = upperFence;

    const ticks: number[] = [];
    const step = span > 20 ? 5 : span > 10 ? 2 : 1;
    const startTick = Math.ceil(minX / step) * step;
    for (let t = startTick; t <= maxX; t += step) {
      ticks.push(t);
    }

    return {
      minX,
      maxX,
      span,
      getPct,
      q1,
      median,
      q3,
      iqr,
      lowerFence,
      upperFence,
      obsMin,
      obsMax,
      whiskerLeft,
      whiskerRight,
      ticks
    };
  }, [outliers, distribution]);

  // Frequency distribution partitioned by IQR outlier fence
  const outlierDistChart = useMemo(() => {
    if (!distribution || !outliers) return [];
    return distribution.histogram.map((bin) => {
      const isOutlier = bin.bin_center > outliers.upper_fence || bin.bin_center < outliers.lower_fence;
      return {
        ...bin,
        name: bin.bin_center.toFixed(1),
        isOutlier,
        fill: isOutlier ? '#e11d48' : '#0284c7'
      };
    });
  }, [distribution, outliers]);

  const modelBars = useMemo(() => {
    if (!methods) return [];
    return methods.models.map((m) => ({
      key: m.key,
      name: shortModelName[m.key] || m.key,
      rmse: m.test_rmse,
      champion: m.key === 'Tuned_HistGradientBoosting'
    }));
  }, [methods]);

  const missChart = useMemo(
    () =>
      missingness
        .slice()
        .sort((a, b) => b.raw_missing_pct - a.raw_missing_pct)
        .slice(0, 8)
        .map((m) => ({
          full: m.variable,
          name: m.variable
            .replace('(GT)', '')
            .replace('PT08.', 'S')
            .replace('(CO)', '')
            .replace('(NMHC)', '')
            .replace('(NOx)', '')
            .replace('(NO2)', '')
            .replace('(O3)', ''),
          raw: m.raw_missing_pct,
          cleaned: m.cleaned_missing_pct,
          status: m.status
        })),
    [missingness]
  );

  if (loading) return <LoadingState label="Loading statistics lab…" />;
  if (error || !distribution || !outliers || !probabilities || !methods) {
    return <ErrorState message={error || undefined} onRetry={load} />;
  }

  const vars = methods.allowed_distribution_variables;
  const champion = methods.models.find((m) => m.key === 'Tuned_HistGradientBoosting');

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Statistics Lab
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
            Cleaning, IQR outliers, distribution vs normal curve, empirical probabilities, and model comparison —
            the Business Statistics walkthrough for viva and assessment.
          </p>
        </div>

        <GlassCard className="p-3 sm:p-4">
          <div className="flex flex-col gap-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Analyze variable
            </div>
            <div className="flex flex-wrap gap-2">
              {vars.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariable(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    variable === v
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                      : 'glass-soft text-slate-700 border-white/50 hover:bg-white/55'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 1. Process */}
      <GlassCard className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl glass-inner text-sky-700 flex items-center justify-center">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">1. How we worked</h2>
            <p className="text-[11px] text-slate-500">End-to-end pipeline from raw UCI file to holdout evaluation</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {methods.process_steps.map((s) => (
            <div key={s.step} className="relative p-4 rounded-2xl glass-inner space-y-2 min-h-[7.5rem]">
              <div className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-sky-600 text-white text-[11px] font-bold font-mono">
                {s.step}
              </div>
              <div className="text-sm font-bold text-slate-900">{s.title}</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* 2. Cleaning */}
      <GlassCard className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl glass-inner text-sky-700 flex items-center justify-center">
            <Brush className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">2. Data cleaning</h2>
            <p className="text-[11px] text-slate-500">
              Sentinel <code className="font-mono text-sky-800">−200</code> handling and missingness after prep
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {methods.cleaning_steps.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-xs text-slate-700 p-3 rounded-xl glass-soft">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{c}</span>
            </li>
          ))}
        </ul>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-xs font-bold text-slate-800">Missingness before vs after cleaning</h3>
            <p className="text-[10px] text-slate-500">NMHC dropped → 100% removed from modelling set</p>
          </div>
          <div className="h-[320px] w-full rounded-2xl glass-inner p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={missChart}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={72}
                  tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                />
                <Tooltip
                  contentStyle={tipStyle}
                  formatter={(value, name) => [`${Number(value).toFixed(2)}%`, String(name)]}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.full || ''}
                />
                <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="raw" name="Raw −200 missing %" fill="#0284c7" radius={[0, 6, 6, 0]} barSize={12} />
                <Bar dataKey="cleaned" name="After cleaning %" fill="#94a3b8" radius={[0, 6, 6, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>

      {/* 3. Outliers */}
      <GlassCard className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/40 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl glass-inner text-sky-700 flex items-center justify-center">
              <BoxSelect className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                3. Outliers (IQR Fences & Tukey Box Plot)
              </h2>
              <p className="text-[11px] text-slate-500">
                Formula: Lower &lt; Q1−1.5×IQR · Upper &gt; Q3+1.5×IQR · variable: <span className="font-mono text-sky-800 font-semibold">{variable}</span>
              </p>
            </div>
          </div>

          {/* View Mode Selector for Outliers */}
          <div className="inline-flex p-1 rounded-xl glass-inner border border-white/50 text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setOutlierViewMode('boxplot')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                outlierViewMode === 'boxplot' ? 'bg-white text-sky-800 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BoxSelect className="w-3.5 h-3.5" />
              Tukey Box Plot
            </button>
            <button
              onClick={() => setOutlierViewMode('distribution')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                outlierViewMode === 'distribution' ? 'bg-white text-sky-800 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Distribution & Fences
            </button>
            <button
              onClick={() => setOutlierViewMode('inspector')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                outlierViewMode === 'inspector' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Peak Inspector
            </button>
          </div>
        </div>

        {/* Statistical Summary Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'IQR (Q3 − Q1)', value: outliers.iqr, sub: 'Middle 50% spread', color: 'text-slate-900' },
            { label: 'Lower fence', value: outliers.lower_fence, sub: 'Physical bound: ≥ 0.0', color: 'text-sky-800' },
            { label: 'Upper fence', value: outliers.upper_fence, sub: 'Threshold for peaks', color: 'text-rose-700' },
            { label: 'Outlier rate', value: `${outliers.outlier_rate_pct}%`, sub: `${outliers.right_outlier_count} / ${outliers.n} points`, color: 'text-rose-700' }
          ].map((k) => (
            <div key={k.label} className="p-3.5 rounded-2xl glass-inner border border-white/50">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{k.label}</div>
              <div className={`text-xl font-bold font-mono mt-0.5 ${k.color}`}>{k.value}</div>
              <div className="text-[10px] text-slate-400 mt-1">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Lower vs Upper Outlier Split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl glass-inner border border-sky-200/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Left / Lower Outliers (&lt; {outliers.lower_fence})</span>
              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                0.00%
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-sky-800 mt-1">{outliers.left_outlier_count}</div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              Formula yields {outliers.lower_fence}, but chemical concentration cannot be negative (floor = 0.0 mg/m³). No observations fall below this threshold.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-inner border border-rose-200/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Right / Upper Outliers (&gt; {outliers.upper_fence})</span>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-mono">
                {outliers.outlier_rate_pct}%
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-rose-700 mt-1">{outliers.right_outlier_count}</div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              {outliers.sample_right_outliers.length
                ? `Severe exposure peaks: ${outliers.sample_right_outliers.slice(0, 6).join(', ')} mg/m³...`
                : 'None above the upper fence for this variable.'}
            </p>
          </div>
        </div>

        {/* VIEW 1: True Tukey Box-and-Whisker Plot */}
        {outlierViewMode === 'boxplot' && boxplotGeometry && (
          <div className="relative w-full rounded-2xl glass-inner p-5 space-y-5 overflow-hidden border border-white/60">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <BoxSelect className="w-4 h-4 text-sky-600" />
                Continuous Tukey Box & Whisker Projection
              </span>
              <span className="text-[11px] text-slate-500">
                Hover over red dots to inspect peak outlier readings
              </span>
            </div>

            {/* Visual Boxplot Track */}
            <div className="relative h-44 w-full pt-8">
              {/* Background Zoned Regions */}
              <div className="absolute inset-0 top-8 bottom-8 rounded-xl overflow-hidden flex border border-slate-200/70">
                {/* Non-physical Zone (< 0) */}
                {boxplotGeometry.minX < 0 && (
                  <div
                    style={{ width: `${boxplotGeometry.getPct(0)}%` }}
                    className="h-full bg-slate-100/80 border-r-2 border-dashed border-slate-400 flex flex-col justify-end p-2 relative group"
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                      &lt; 0 Truncation
                    </span>
                    <span className="text-[9px] text-slate-400 truncate">0 Left Outliers</span>
                  </div>
                )}

                {/* Normal / Within Fences Zone */}
                <div
                  style={{
                    width: `${boxplotGeometry.getPct(boxplotGeometry.upperFence) - boxplotGeometry.getPct(Math.max(0, boxplotGeometry.lowerFence))}%`
                  }}
                  className="h-full bg-sky-50/50 flex flex-col justify-start p-2 relative border-r-2 border-dashed border-rose-400"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-sky-800">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
                      Inlier Domain (97.26%)
                    </span>
                    <span className="text-slate-500 font-mono">0.0 to {boxplotGeometry.upperFence.toFixed(1)} mg/m³</span>
                  </div>
                </div>

                {/* Upper Outlier Zone */}
                <div
                  style={{ width: `${100 - boxplotGeometry.getPct(boxplotGeometry.upperFence)}%` }}
                  className="h-full bg-rose-50/60 flex flex-col justify-start p-2 relative"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-rose-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                      Upper Outlier Zone (&gt; 5.5)
                    </span>
                    <span className="font-mono text-rose-800">{outliers.right_outlier_count} peaks</span>
                  </div>
                </div>
              </div>

              {/* Whiskers Horizontal Line */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-sky-700"
                style={{
                  left: `${boxplotGeometry.getPct(boxplotGeometry.whiskerLeft)}%`,
                  width: `${boxplotGeometry.getPct(boxplotGeometry.upperFence) - boxplotGeometry.getPct(boxplotGeometry.whiskerLeft)}%`
                }}
              />

              {/* Left Whisker End Cap */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-7 bg-sky-700 rounded-full"
                style={{ left: `${boxplotGeometry.getPct(boxplotGeometry.whiskerLeft)}%` }}
                title={`Minimum Observed: ${boxplotGeometry.whiskerLeft.toFixed(2)} mg/m³`}
              />

              {/* The IQR Box (Q1 to Q3) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-16 rounded-xl bg-gradient-to-r from-sky-200 via-sky-100 to-sky-200 border-2 border-sky-600 shadow-md flex items-center justify-center transition-all cursor-pointer group"
                style={{
                  left: `${boxplotGeometry.getPct(boxplotGeometry.q1)}%`,
                  width: `${Math.max(2, boxplotGeometry.getPct(boxplotGeometry.q3) - boxplotGeometry.getPct(boxplotGeometry.q1))}%`
                }}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-800/80 group-hover:scale-105 transition-transform">
                  IQR (50%)
                </span>

                {/* Median Line inside Box */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-sky-900 z-10 shadow-sm"
                  style={{
                    left: `${((boxplotGeometry.median - boxplotGeometry.q1) / (boxplotGeometry.q3 - boxplotGeometry.q1)) * 100}%`
                  }}
                >
                  <div className="absolute -top-6 -translate-x-1/2 px-2 py-0.5 rounded-md bg-sky-900 text-white font-mono font-bold text-[10px] whitespace-nowrap shadow">
                    Median: {boxplotGeometry.median.toFixed(2)}
                  </div>
                </div>

                {/* Q1 Pin */}
                <div className="absolute -bottom-7 left-0 -translate-x-1/2 px-1.5 py-0.5 rounded bg-white/95 text-[9px] font-mono font-bold text-sky-900 border border-sky-300 shadow-xs whitespace-nowrap">
                  Q1: {boxplotGeometry.q1.toFixed(2)}
                </div>

                {/* Q3 Pin */}
                <div className="absolute -bottom-7 right-0 translate-x-1/2 px-1.5 py-0.5 rounded bg-white/95 text-[9px] font-mono font-bold text-sky-900 border border-sky-300 shadow-xs whitespace-nowrap">
                  Q3: {boxplotGeometry.q3.toFixed(2)}
                </div>
              </div>

              {/* Lower Fence Marker */}
              <div
                className="absolute top-2 bottom-2 w-px border-l-2 border-dashed border-sky-500 z-10"
                style={{ left: `${boxplotGeometry.getPct(boxplotGeometry.lowerFence)}%` }}
              >
                <div className="absolute -top-3 -translate-x-1/2 px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-mono font-bold whitespace-nowrap border border-sky-300 shadow-xs">
                  Lower Fence: {boxplotGeometry.lowerFence.toFixed(1)}
                </div>
              </div>

              {/* Upper Fence Marker */}
              <div
                className="absolute top-2 bottom-2 w-px border-l-2 border-dashed border-rose-500 z-10"
                style={{ left: `${boxplotGeometry.getPct(boxplotGeometry.upperFence)}%` }}
              >
                <div className="absolute -top-3 -translate-x-1/2 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-mono font-bold whitespace-nowrap shadow-sm">
                  Upper Fence: {boxplotGeometry.upperFence.toFixed(1)}
                </div>
              </div>

              {/* Individual Outlier Points (Ruby Scatter Dots with Hover Tooltip) */}
              {outliers.sample_right_outliers.map((val, idx) => {
                const leftPct = boxplotGeometry.getPct(val);
                const topOffsets = ['34%', '52%', '66%', '42%', '60%', '46%', '62%', '38%'];
                const topPos = topOffsets[idx % topOffsets.length];

                return (
                  <div
                    key={`${val}-${idx}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                    style={{ left: `${leftPct}%`, top: topPos }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-600 ring-2 ring-white shadow-md group-hover:scale-150 group-hover:bg-rose-700 transition-all cursor-pointer" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-30">
                      {val.toFixed(1)} mg/m³ (+{(val - boxplotGeometry.upperFence).toFixed(1)} over fence)
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continuous Axis Ticks */}
            <div className="relative w-full border-t border-slate-300 pt-2 flex justify-between text-[11px] font-mono text-slate-500">
              {boxplotGeometry.ticks.map((t) => (
                <div
                  key={t}
                  className="absolute -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${boxplotGeometry.getPct(t)}%` }}
                >
                  <div className="w-px h-1.5 bg-slate-300 -mt-2 mb-1" />
                  <span className={t === 0 ? 'font-bold text-slate-900' : ''}>{t}</span>
                </div>
              ))}
            </div>
            <div className="text-center text-[11px] text-slate-400 font-medium">
              Numeric concentration scale (mg/m³) · Showing Interquartile Box, Median line, Whisker boundaries, and Right Outliers
            </div>
          </div>
        )}

        {/* VIEW 2: Distribution Histogram with Colored Outlier Fence Zones */}
        {outlierViewMode === 'distribution' && (
          <div className="h-64 w-full rounded-2xl glass-inner p-4 space-y-2">
            <div className="flex items-center justify-between text-xs px-2">
              <span className="font-semibold text-slate-700">Histogram partitioned by Upper Fence ({outliers.upper_fence} mg/m³)</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-sky-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
                  Within Fences (97.26%)
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                  Outliers (2.74%)
                </span>
              </div>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outlierDistChart} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} interval={2} unit=" mg" />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={tipStyle}
                    formatter={(val: any, _, item: any) => [
                      `${val} observations`,
                      item?.payload?.isOutlier ? 'Upper Outlier Zone (> 5.5 mg)' : 'Normal Inlier Range'
                    ]}
                    labelFormatter={(label) => `Concentration ~ ${label} mg/m³`}
                  />
                  <ReferenceLine
                    x={outlierDistChart.find((b) => b.bin_center >= outliers.upper_fence)?.name || '5.5'}
                    stroke="#e11d48"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{
                      value: `Fence: ${outliers.upper_fence} mg`,
                      position: 'insideTopRight',
                      fill: '#be123c',
                      fontSize: 10,
                      fontWeight: 700
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {outlierDistChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 3: Peak Outlier Episodes Inspector */}
        {outlierViewMode === 'inspector' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-700 px-1">
              Top recorded pollution peaks exceeding the upper fence ({outliers.upper_fence} mg/m³):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {outliers.sample_right_outliers.map((peak, idx) => {
                const excess = +(peak - outliers.upper_fence).toFixed(2);
                const multiple = +(peak / outliers.median).toFixed(1);
                return (
                  <div key={idx} className="p-3 rounded-2xl glass-inner border border-rose-200/50 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Peak #{idx + 1}</span>
                      <span className="font-bold text-rose-700 font-mono">+{excess} mg</span>
                    </div>
                    <div className="text-lg font-black font-mono text-rose-700">{peak} mg/m³</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {multiple}× typical median ({outliers.median})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistical & Domain Justification Callouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl glass-soft text-xs text-slate-700 leading-relaxed border border-white/60 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              Why is the Lower Fence −1.7 mg/m³?
            </div>
            <p className="text-[11px] text-slate-600">
              Formula: <span className="font-mono font-semibold">Q1 − 1.5×IQR = 1.0 − 2.7 = −1.7</span>. Atmospheric pollutants are physical concentrations bounded at <span className="font-mono font-semibold">CO ≥ 0</span>. With minimum observed reading at 0.10 mg/m³, no readings can fall below −1.7, yielding <strong className="text-slate-800">0 left outliers</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl glass-soft text-xs text-slate-700 leading-relaxed border border-white/60 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Why are the 256 Upper Outliers Retained?
            </div>
            <p className="text-[11px] text-slate-600">
              {outliers.policy} Deleting these 256 points (&gt; 5.5 mg/m³, max 11.9) would introduce severe survivorship bias and underestimate hazardous smog risks during winter thermal inversions.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* 4. Distribution */}
      <GlassCard className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl glass-inner text-sky-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">4. Distribution & normal curve</h2>
            <p className="text-[11px] text-slate-500">
              Histogram vs theoretical Normal(μ, σ) overlay for <span className="font-mono text-sky-800">{variable}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Mean', distribution.mean],
            ['Std', distribution.std],
            ['Skewness', distribution.skewness],
            ['Kurtosis', distribution.kurtosis]
          ].map(([k, v]) => (
            <div key={String(k)} className="p-3.5 rounded-2xl glass-inner">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{k}</div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-1">{v}</div>
            </div>
          ))}
        </div>

        <div className="h-72 w-full rounded-2xl glass-inner p-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={histChart} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={tipStyle} />
              <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="count" name="Histogram" fill="#7dd3fc" radius={[4, 4, 0, 0]} barSize={16} />
              <Line
                type="monotone"
                dataKey="normal"
                name="Normal overlay"
                stroke="#0369a1"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Positive skew means the normal curve is a teaching comparison, not a claim that {variable} is perfectly Gaussian.
        </p>
      </GlassCard>

      {/* 5. Probabilities */}
      <GlassCard className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl glass-inner text-sky-700 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">5. Empirical probabilities</h2>
            <p className="text-[11px] text-slate-500">Percentiles and frequency-based P(CO events) on cleaned hourly data</p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.entries(probabilities.percentiles).map(([k, v]) => (
            <div key={k} className="p-3 rounded-2xl glass-inner text-center">
              <div className="text-[10px] font-mono uppercase tracking-wide text-slate-400">{k}</div>
              <div className="text-sm font-bold font-mono text-slate-900 mt-1">{v}</div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/50 glass-inner">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-white/40 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="text-left px-4 py-3 font-semibold">Event</th>
                <th className="text-right px-4 py-3 font-semibold">Hours</th>
                <th className="text-right px-4 py-3 font-semibold">Empirical P</th>
              </tr>
            </thead>
            <tbody>
              {probabilities.thresholds.map((t, i) => (
                <tr key={t.rule} className={i % 2 === 0 ? 'bg-white/15' : 'bg-transparent'}>
                  <td className="px-4 py-2.5 text-slate-800 font-medium">{t.label}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-600">{t.count.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-sky-800">
                    {(t.probability * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="h-56 w-full rounded-2xl glass-inner p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={probabilities.empirical_cdf} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={tipStyle} />
              <Area
                type="monotone"
                dataKey="cdf"
                name="Empirical CDF"
                stroke="#0284c7"
                fill="#bae6fd"
                fillOpacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">{probabilities.note}</p>
      </GlassCard>

      {/* 6. Models */}
      <GlassCard className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl glass-inner text-sky-700 flex items-center justify-center">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">6. Models & methods</h2>
            <p className="text-[11px] text-slate-500">Holdout test metrics — lower RMSE is better</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {methods.models.map((m) => {
            const isChamp = m.key === 'Tuned_HistGradientBoosting';
            return (
              <div
                key={m.key}
                className={`p-4 rounded-2xl space-y-2 ${
                  isChamp
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                    : 'glass-inner'
                }`}
              >
                <div className={`text-[11px] font-bold leading-snug ${isChamp ? 'text-white' : 'text-slate-900'}`}>
                  {shortModelName[m.key] || m.label}
                </div>
                <div className={`text-[10px] font-mono space-y-0.5 ${isChamp ? 'text-sky-50' : 'text-slate-600'}`}>
                  <div>RMSE {m.test_rmse}</div>
                  <div>MAE {m.test_mae}</div>
                  <div>R² {m.test_r2}</div>
                </div>
                {isChamp && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    <Award className="w-3 h-3" /> Champion
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-64 w-full rounded-2xl glass-inner p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelBars} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={tipStyle} />
              <Bar dataKey="rmse" name="Test RMSE" radius={[8, 8, 0, 0]} barSize={36}>
                {modelBars.map((entry) => (
                  <Cell key={entry.key} fill={entry.champion ? '#0284c7' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {champion && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl glass-soft border border-sky-200/50">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">{methods.primary_model.name}</strong>
              {' '}· Test RMSE {methods.primary_model.test_rmse}
              {' '}· R² {methods.primary_model.test_r2}
              {methods.primary_model.rmse_improvement_over_baseline_pct != null && (
                <> · <span className="font-semibold text-sky-800">+{methods.primary_model.rmse_improvement_over_baseline_pct}% RMSE vs baseline</span></>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
