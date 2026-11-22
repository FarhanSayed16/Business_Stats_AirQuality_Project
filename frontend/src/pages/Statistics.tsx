import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, Line, ComposedChart, Area, AreaChart, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Workflow, Brush, BoxSelect, Activity, Percent, FlaskConical, CheckCircle2, Award
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

  const fenceChart = useMemo(() => {
    if (!outliers) return [];
    return [
      { name: 'Lower', value: outliers.lower_fence, fill: '#0369a1' },
      { name: 'Q1', value: outliers.q1, fill: '#0ea5e9' },
      { name: 'Median', value: outliers.median, fill: '#0284c7' },
      { name: 'Q3', value: outliers.q3, fill: '#0ea5e9' },
      { name: 'Upper', value: outliers.upper_fence, fill: '#be123c' }
    ];
  }, [outliers]);

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
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl glass-inner text-sky-700 flex items-center justify-center">
            <BoxSelect className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">3. Outliers (IQR fences)</h2>
            <p className="text-[11px] text-slate-500">
              Left/lower &lt; Q1−1.5×IQR · Right/upper &gt; Q3+1.5×IQR · variable: <span className="font-mono text-sky-800">{variable}</span>
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl glass-soft text-xs text-slate-600 leading-relaxed border border-white/40">
          {outliers.policy}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'IQR', value: outliers.iqr },
            { label: 'Lower fence', value: outliers.lower_fence },
            { label: 'Upper fence', value: outliers.upper_fence },
            { label: 'Outlier rate', value: `${outliers.outlier_rate_pct}%` }
          ].map((k) => (
            <div key={k.label} className="p-3.5 rounded-2xl glass-inner">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{k.label}</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl glass-inner border border-sky-200/40">
            <div className="text-xs font-bold text-slate-800">Left / lower outliers</div>
            <div className="text-3xl font-black font-mono text-sky-800 mt-1">{outliers.left_outlier_count}</div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              {outliers.sample_left_outliers.length
                ? `Examples: ${outliers.sample_left_outliers.join(', ')}`
                : 'None below the lower fence for this variable.'}
            </p>
          </div>
          <div className="p-4 rounded-2xl glass-inner border border-rose-200/40">
            <div className="text-xs font-bold text-slate-800">Right / upper outliers</div>
            <div className="text-3xl font-black font-mono text-rose-700 mt-1">{outliers.right_outlier_count}</div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              {outliers.sample_right_outliers.length
                ? `Examples: ${outliers.sample_right_outliers.join(', ')}`
                : 'None above the upper fence for this variable.'}
            </p>
          </div>
        </div>

        <div className="h-56 w-full rounded-2xl glass-inner p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fenceChart} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={tipStyle} />
              <Bar dataKey="value" name={`${variable} value`} radius={[8, 8, 0, 0]}>
                {fenceChart.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
