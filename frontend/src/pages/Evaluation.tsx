import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { Award, AlertTriangle, ShieldCheck, BarChart3, TrendingUp, Sliders, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import type { EvaluationDetails } from '../types';

export const Evaluation: React.FC = () => {
  const [data, setData] = useState<EvaluationDetails | null>(null);

  useEffect(() => {
    api.getEvaluation()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Empirical Out-Of-Sample Validation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Model Evaluation & Statistical Rigor
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Honest validation on an untouched chronological holdout partition (1,403 unseen hours), permutation feature attribution, and critical appraisal of real-world monitoring utility.
        </p>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-[#0b1220]/75 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-400" />
              <span>Comparative Benchmark Table (Validation & Holdout Test)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluated strictly on chronological partitions. Baseline predicts next hour = current hour.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 self-start sm:self-auto font-mono">
            Chronological Split Protocol
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 font-sans font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Model Candidate</th>
                <th className="py-3 px-3">Val RMSE</th>
                <th className="py-3 px-3">Val MAE</th>
                <th className="py-3 px-3">Val R²</th>
                <th className="py-3 px-3 text-teal-300">Test RMSE</th>
                <th className="py-3 px-3 text-teal-300">Test MAE</th>
                <th className="py-3 px-3 text-teal-300 font-bold">Test R²</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data?.models_comparison && (
                <>
                  <tr className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Persistence Baseline (Naive)</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.val_rmse}</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.val_mae}</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.val_r2}</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.test_rmse}</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.test_mae}</td>
                    <td className="py-3 px-3 font-semibold text-slate-400">{data.models_comparison['Persistence_Baseline']?.test_r2}</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Linear Regression (Standardized)</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.val_rmse}</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.val_mae}</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.val_r2}</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.test_rmse}</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.test_mae}</td>
                    <td className="py-3 px-3 font-semibold text-slate-400">{data.models_comparison['Linear_Regression']?.test_r2}</td>
                  </tr>
                  <tr className="bg-teal-500/[0.08] hover:bg-teal-500/[0.12] transition-colors border-t border-b border-teal-500/30">
                    <td className="py-3 px-4 font-sans font-bold text-teal-300 flex items-center gap-2">
                      <Award className="w-4 h-4 text-teal-400" />
                      <span>Tuned HistGradientBoosting (Selected Champion)</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-300">{data.models_comparison['Tuned_HistGradientBoosting']?.val_rmse}</td>
                    <td className="py-3 px-3 font-bold text-teal-300">{data.models_comparison['Tuned_HistGradientBoosting']?.val_mae}</td>
                    <td className="py-3 px-3 font-bold text-teal-300">{data.models_comparison['Tuned_HistGradientBoosting']?.val_r2}</td>
                    <td className="py-3 px-3 font-black text-teal-300 text-sm">{data.models_comparison['Tuned_HistGradientBoosting']?.test_rmse}</td>
                    <td className="py-3 px-3 font-black text-teal-300 text-sm">{data.models_comparison['Tuned_HistGradientBoosting']?.test_mae}</td>
                    <td className="py-3 px-3 font-black text-emerald-300 text-sm">{data.models_comparison['Tuned_HistGradientBoosting']?.test_r2}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Attribution & Error Regimes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permutation Feature Importance Bar Chart */}
        <div className="bg-[#0b1220]/75 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span>Feature Importance (Statistical Attribution)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                5-fold permutation importance measured on validation set (loss in RMSE when shuffled).
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono">
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
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} unit=" Δ" />
                <YAxis
                  type="category"
                  dataKey="feature"
                  stroke="#94a3b8"
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
                  contentStyle={{ backgroundColor: '#0b1220', borderRadius: '12px', border: '1px solid #334155', color: '#f1f5f9', fontSize: '12px' }}
                />
                <Bar dataKey="importance" fill="#0d9488" radius={[0, 6, 6, 0]}>
                  {(data?.feature_importance?.slice(0, 8) || []).map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#14b8a6' : index < 3 ? '#0d9488' : '#0f766e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>Key Finding:</strong> Current CO concentration is the primary driver, followed by diurnal traffic encodings (<code className="font-mono text-teal-300">hour_cos</code>, <code className="font-mono text-teal-300">hour_sin</code>) and the tin oxide sensor <code className="font-mono text-teal-300">PT08.S1</code>.
            </span>
          </div>
        </div>

        {/* Holdout Error by Pollution Tier */}
        <div className="bg-[#0b1220]/75 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Holdout Error by Pollution Episode Tier</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation of 1,403 test observations partitioned by true ground-truth severity.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 font-mono">
              1,403 Hours Tested
            </span>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 font-sans font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Pollution Tier</th>
                  <th className="py-2.5 px-2">Holdout Hours</th>
                  <th className="py-2.5 px-2">Test Share</th>
                  <th className="py-2.5 px-2 text-slate-300">MAE</th>
                  <th className="py-2.5 px-2 text-slate-300 font-bold">RMSE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data?.error_by_pollution_tier && data.error_by_pollution_tier.length > 0 ? (
                  data.error_by_pollution_tier.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">
                        {tier.tier} <span className="text-[11px] font-normal text-slate-400 font-mono">({tier.range})</span>
                      </td>
                      <td className="py-2.5 px-2">{tier.count}</td>
                      <td className="py-2.5 px-2">{tier.pct_of_test}%</td>
                      <td className="py-2.5 px-2 font-semibold text-slate-200">{tier.mae} mg/m³</td>
                      <td className="py-2.5 px-2 font-bold text-teal-300">{tier.rmse} mg/m³</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500 font-sans">Loading error breakdown...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-amber-200/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Non-Linear Asymmetry:</strong> For routine conditions (&lt;2.0 mg/m³), MAE is exceptionally low (<strong>0.24 mg/m³</strong>). Error widens to <strong>0.99 mg/m³</strong> on rare extreme spikes (&gt;4.0 mg/m³) due to bounded tree leaves.
            </span>
          </div>
        </div>
      </div>

      {/* Actual vs Predicted Test Timeline */}
      <div className="bg-[#0b1220]/75 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span>Test Holdout Timeline: Actual vs Predicted Next-Hour CO</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological segment of 120 consecutive test hours comparing ground truth against model forecasts and the naive baseline.
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.test_evaluation_series || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="datetime" tickFormatter={(dt) => dt.split(' ')[1]?.slice(0, 5) || ''} stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={11} unit=" mg" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b1220', borderRadius: '12px', border: '1px solid #334155', color: '#f1f5f9', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={2.5} name="Actual Observed Next CO" dot={{ r: 2, fill: '#38bdf8' }} />
              <Line type="monotone" dataKey="predicted" stroke="#2dd4bf" strokeWidth={2.5} strokeDasharray="3 3" name="HistGradientBoosting Forecast" dot={false} />
              <Line type="monotone" dataKey="baseline" stroke="#64748b" strokeWidth={1} name="Persistence Baseline" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Narrative: Usefulness vs Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-World Usefulness */}
        <div className="bg-[#0b1220]/75 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Practical Municipal & Health Usefulness</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <strong className="text-white text-xs">1. Proactive Traffic & Signal Timing Adjustments</strong>
              <p className="text-slate-400">
                Because urban CO is caused by internal combustion vehicle idling, a 1-hour lead warning allows municipal controllers to dynamically extend green lights or reroute commercial traffic to perimeter bypasses before stagnation occurs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <strong className="text-white text-xs">2. Sensitive Population Health Alerts</strong>
              <p className="text-slate-400">
                Carboxyhemoglobin toxicity threatens cardiovascular and asthmatic patients. Advance warnings enable local schools, hospitals, and outdoor athletic centers to bring activities indoors prior to peak commuter waves.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <strong className="text-white text-xs">3. Low-Cost Solid-State Sensor Calibration</strong>
              <p className="text-slate-400">
                Metal-oxide semiconductor sensors (<code className="font-mono text-teal-300">PT08.S1</code>) suffer from thermal drift. Discrepancies between predictions and sensors help identify when distributed hardware needs re-calibration.
              </p>
            </div>
          </div>
        </div>

        {/* Limitations & Failure Modes */}
        <div className="bg-[#0b1220]/75 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-base border-b border-slate-800 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Statistical Limitations & Failure Modes</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 space-y-1">
              <strong className="text-rose-200 text-xs">1. Underestimation of Extreme Episodes</strong>
              <p className="text-rose-300/80">
                Decision tree partitions cannot extrapolate beyond highest seen training bounds. For extreme spikes (<code className="font-mono text-rose-200">&gt;5.0 mg/m³</code>), MAE increases from 0.23 to 1.14 mg/m³, systematically under-predicting peak episodes.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <strong className="text-white text-xs">2. Microclimatic Stationarity</strong>
              <p className="text-slate-400">
                The dataset represents a single fixed road-level station in Italy. Street canyon geometry and local wind tunnels mean this model cannot be deployed in other cities without local fine-tuning.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <strong className="text-white text-xs">3. Lack of Exogenous Traffic Telemetry</strong>
              <p className="text-slate-400">
                The model infers traffic solely from chemical sensors and time encodings. It cannot anticipate sudden traffic halts caused by emergency road closures or accidents without direct vehicle count feeds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
