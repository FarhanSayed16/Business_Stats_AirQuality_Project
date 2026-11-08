import React, { useCallback, useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { Award, AlertTriangle, ShieldCheck, BarChart3, TrendingUp, Sliders, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import type { EvaluationDetails } from '../types';
import { ErrorState, LoadingState } from '../components/ui';

const MODEL_LABELS: Record<string, string> = {
  Persistence_Baseline: 'Persistence Baseline (Naive)',
  Linear_Regression: 'Linear Regression (Standardized)',
  Ridge_Regression: 'Ridge Regression (α=10)',
  Random_Forest: 'Random Forest Regressor',
  Tuned_HistGradientBoosting: 'Tuned HistGradientBoosting (Champion)'
};

export const Evaluation: React.FC = () => {
  const [data, setData] = useState<EvaluationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getEvaluation()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load evaluation');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading model evaluation…" />;
  if (error || !data) return <ErrorState message={error || undefined} onRetry={load} />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold tracking-wide border border-sky-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Empirical Out-Of-Sample Validation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Evaluation & Statistical Rigor
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Honest validation on an untouched chronological holdout partition (1,403 unseen hours), permutation feature attribution, and critical appraisal of real-world monitoring utility.
        </p>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/40 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600" />
              <span>Comparative Benchmark Table (Validation & Holdout Test)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated strictly on chronological partitions. Baseline predicts next hour = current hour.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 self-start sm:self-auto font-mono">
            Chronological Split Protocol
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 font-sans font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Model Candidate</th>
                <th className="py-3 px-3">Val RMSE</th>
                <th className="py-3 px-3">Val MAE</th>
                <th className="py-3 px-3">Val R²</th>
                <th className="py-3 px-3 text-sky-800">Test RMSE</th>
                <th className="py-3 px-3 text-sky-800">Test MAE</th>
                <th className="py-3 px-3 text-sky-800 font-bold">Test R²</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {Object.entries(data.models_comparison).map(([key, row]) => {
                const isChamp = key === 'Tuned_HistGradientBoosting';
                return (
                  <tr
                    key={key}
                    className={
                      isChamp
                        ? 'bg-sky-50/70 hover:bg-sky-50/90 transition-colors border-t border-b border-sky-200'
                        : 'hover:bg-slate-50/70 transition-colors'
                    }
                  >
                    <td className={`py-3 px-4 font-sans ${isChamp ? 'font-bold text-sky-900' : 'font-semibold text-slate-900'}`}>
                      <span className="inline-flex items-center gap-2">
                        {isChamp && <Award className="w-4 h-4 text-sky-600" />}
                        {MODEL_LABELS[key] || key}
                      </span>
                    </td>
                    <td className={`py-3 px-3 ${isChamp ? 'font-bold text-sky-800' : ''}`}>{row.val_rmse}</td>
                    <td className={`py-3 px-3 ${isChamp ? 'font-bold text-sky-800' : ''}`}>{row.val_mae}</td>
                    <td className={`py-3 px-3 ${isChamp ? 'font-bold text-sky-800' : ''}`}>{row.val_r2}</td>
                    <td className={`py-3 px-3 ${isChamp ? 'font-black text-sky-900 text-sm' : ''}`}>{row.test_rmse}</td>
                    <td className={`py-3 px-3 ${isChamp ? 'font-black text-sky-900 text-sm' : ''}`}>{row.test_mae}</td>
                    <td className={`py-3 px-3 ${isChamp ? 'font-black text-sky-950 text-sm' : 'font-semibold text-slate-500'}`}>{row.test_r2}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Attribution & Error Regimes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permutation Feature Importance Bar Chart */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                <span>Feature Importance (Statistical Attribution)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                5-fold permutation importance measured on validation set (loss in RMSE when shuffled).
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono">
              Permutation Test
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data?.feature_importance?.slice(0, 8) || []}
                margin={{ top: 5, right: 30, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={10} unit=" Δ" />
                <YAxis
                  type="category"
                  dataKey="feature"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  width={85}
                  fontFamily="JetBrains Mono"
                />
                <Tooltip
                  formatter={(val: any, _name: any, item: any) => [
                    `${val} mg/m³ Δ RMSE (${item.payload.label})`,
                    'Permutation Loss'
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#0284c7" radius={[0, 6, 6, 0]}>
                  {(data?.feature_importance?.slice(0, 8) || []).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#0284c7' : index < 3 ? '#0284c7' : '#14b8a6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-600 glass-inner p-3 rounded-xl flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Key Finding:</strong> Current CO concentration is the primary driver, followed by diurnal traffic encodings (<code className="font-mono text-sky-700">hour_cos</code>, <code className="font-mono text-sky-700">hour_sin</code>) and the tin oxide sensor <code className="font-mono text-sky-700">PT08.S1</code>.
            </span>
          </div>
        </div>

        {/* Holdout Error by Pollution Tier */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>Holdout Error by Pollution Episode Tier</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation of 1,403 test observations partitioned by true ground-truth severity.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-mono">
              1,403 Hours Tested
            </span>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-600 font-sans font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Pollution Tier</th>
                  <th className="py-2.5 px-2">Holdout Hours</th>
                  <th className="py-2.5 px-2">Test Share</th>
                  <th className="py-2.5 px-2 text-slate-800">MAE</th>
                  <th className="py-2.5 px-2 text-slate-800 font-bold">RMSE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data?.error_by_pollution_tier && data.error_by_pollution_tier.length > 0 ? (
                  data.error_by_pollution_tier.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                        {tier.tier} <span className="text-[11px] font-normal text-slate-400 font-mono">({tier.range})</span>
                      </td>
                      <td className="py-2.5 px-2">{tier.count}</td>
                      <td className="py-2.5 px-2">{tier.pct_of_test}%</td>
                      <td className="py-2.5 px-2 font-semibold text-slate-800">{tier.mae} mg/m³</td>
                      <td className="py-2.5 px-2 font-bold text-sky-800">{tier.rmse} mg/m³</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400 font-sans">Loading error breakdown...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Non-Linear Asymmetry:</strong> For routine conditions (&lt;2.0 mg/m³), MAE is exceptionally low (<strong>0.24 mg/m³</strong>). Error widens to <strong>0.99 mg/m³</strong> on rare extreme spikes (&gt;4.0 mg/m³) due to bounded tree leaves.
            </span>
          </div>
        </div>
      </div>

      {/* Actual vs Predicted Test Timeline */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
        <div className="border-b border-white/40 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <span>Test Holdout Timeline: Actual vs Predicted Next-Hour CO</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological segment of 120 consecutive test hours comparing ground truth against model forecasts and the naive baseline.
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.test_evaluation_series || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="datetime" tickFormatter={(dt) => dt.split(' ')[1]?.slice(0, 5) || ''} stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={11} unit=" mg" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="actual" stroke="#0284c7" strokeWidth={2.5} name="Actual Observed Next CO" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="predicted" stroke="#0284c7" strokeWidth={2.5} strokeDasharray="3 3" name="HistGradientBoosting Forecast" dot={false} />
              <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1} name="Persistence Baseline" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Narrative: Usefulness vs Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-World Usefulness */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-base border-b border-white/40 pb-3">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <span>Practical Municipal & Health Usefulness</span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 rounded-xl glass-inner space-y-1">
              <strong className="text-slate-900 text-xs">1. Proactive Traffic & Signal Timing Adjustments</strong>
              <p>
                Because urban CO is caused by internal combustion vehicle idling, a 1-hour lead warning allows municipal controllers to dynamically extend green lights or reroute commercial traffic to perimeter bypasses before stagnation occurs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl glass-inner space-y-1">
              <strong className="text-slate-900 text-xs">2. Sensitive Population Health Alerts</strong>
              <p>
                Carboxyhemoglobin toxicity threatens cardiovascular and asthmatic patients. Advance warnings enable local schools, hospitals, and outdoor athletic centers to bring activities indoors prior to peak commuter waves.
              </p>
            </div>

            <div className="p-3.5 rounded-xl glass-inner space-y-1">
              <strong className="text-slate-900 text-xs">3. Low-Cost Solid-State Sensor Calibration</strong>
              <p>
                Metal-oxide semiconductor sensors (<code className="font-mono text-sky-700">PT08.S1</code>) suffer from thermal drift. Discrepancies between predictions and sensors help identify when distributed hardware needs re-calibration.
              </p>
            </div>
          </div>
        </div>

        {/* Limitations & Failure Modes */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-base border-b border-white/40 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Statistical Limitations & Failure Modes</span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1">
              <strong className="text-rose-900 text-xs">1. Underestimation of Extreme Episodes</strong>
              <p className="text-rose-950">
                Decision tree partitions cannot extrapolate beyond highest seen training bounds. For extreme spikes (<code className="font-mono text-rose-800">&gt;5.0 mg/m³</code>), MAE increases from 0.23 to 1.14 mg/m³, systematically under-predicting peak episodes.
              </p>
            </div>

            <div className="p-3.5 rounded-xl glass-inner space-y-1">
              <strong className="text-slate-900 text-xs">2. Microclimatic Stationarity</strong>
              <p>
                The dataset represents a single fixed road-level station in Italy. Street canyon geometry and local wind tunnels mean this model cannot be deployed in other cities without local fine-tuning.
              </p>
            </div>

            <div className="p-3.5 rounded-xl glass-inner space-y-1">
              <strong className="text-slate-900 text-xs">3. Lack of Exogenous Traffic Telemetry</strong>
              <p>
                The model infers traffic solely from chemical sensors and time encodings. It cannot anticipate sudden traffic halts caused by emergency road closures or accidents without direct vehicle count feeds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
