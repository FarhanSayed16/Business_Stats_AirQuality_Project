import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Award, AlertTriangle, ShieldCheck } from 'lucide-react';
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Evaluation & Statistical Rigor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Honest validation on an untouched chronological holdout partition, residual diagnostics, and critical appraisal of real-world monitoring utility.
        </p>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Comparative Benchmark Table (Validation & Holdout Test)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated strictly on chronological partitions. Baseline predicts next hour = current hour.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            Chronological Split Protocol
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Model Candidate</th>
                <th className="py-3 px-3">Val RMSE (mg/m³)</th>
                <th className="py-3 px-3">Val MAE (mg/m³)</th>
                <th className="py-3 px-3">Val R²</th>
                <th className="py-3 px-3 text-teal-800">Test RMSE (mg/m³)</th>
                <th className="py-3 px-3 text-teal-800">Test MAE (mg/m³)</th>
                <th className="py-3 px-3 text-teal-800 font-bold">Test R²</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data?.models_comparison && (
                <>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Persistence Baseline (Naive)</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.val_rmse}</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.val_mae}</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.val_r2}</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.test_rmse}</td>
                    <td className="py-3 px-3">{data.models_comparison['Persistence_Baseline']?.test_mae}</td>
                    <td className="py-3 px-3 font-semibold">{data.models_comparison['Persistence_Baseline']?.test_r2}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">Linear Regression (Standardized)</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.val_rmse}</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.val_mae}</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.val_r2}</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.test_rmse}</td>
                    <td className="py-3 px-3">{data.models_comparison['Linear_Regression']?.test_mae}</td>
                    <td className="py-3 px-3 font-semibold">{data.models_comparison['Linear_Regression']?.test_r2}</td>
                  </tr>
                  <tr className="bg-teal-50/40 hover:bg-teal-50/70 font-medium">
                    <td className="py-3 px-4 font-bold text-teal-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-teal-600" />
                      <span>Tuned HistGradientBoosting (Selected)</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-teal-800">{data.models_comparison['Tuned_HistGradientBoosting']?.val_rmse}</td>
                    <td className="py-3 px-3 font-bold text-teal-800">{data.models_comparison['Tuned_HistGradientBoosting']?.val_mae}</td>
                    <td className="py-3 px-3 font-bold text-teal-800">{data.models_comparison['Tuned_HistGradientBoosting']?.val_r2}</td>
                    <td className="py-3 px-3 font-bold text-teal-900">{data.models_comparison['Tuned_HistGradientBoosting']?.test_rmse}</td>
                    <td className="py-3 px-3 font-bold text-teal-900">{data.models_comparison['Tuned_HistGradientBoosting']?.test_mae}</td>
                    <td className="py-3 px-3 font-black text-teal-700 text-sm">{data.models_comparison['Tuned_HistGradientBoosting']?.test_r2}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actual vs Predicted Test Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Test Holdout Timeline: Actual vs Predicted Next-Hour CO
          </h3>
          <p className="text-xs text-slate-500">
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
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="actual" stroke="#0284c7" strokeWidth={2.5} name="Actual Observed Next CO" dot={{ r: 2 }} />
              <Line type="monotone" dataKey="predicted" stroke="#0f766e" strokeWidth={2.5} strokeDasharray="3 3" name="HistGradientBoosting Forecast" dot={false} />
              <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1} name="Persistence Baseline" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Critical Narrative: Usefulness vs Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-World Usefulness */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Practical Municipal & Health Usefulness</span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-800 text-xs">1. Proactive Traffic & Signal Timing Adjustments</strong>
              <p>
                Because urban CO is caused by internal combustion vehicle idling, a 1-hour lead warning allows municipal controllers to dynamically extend green lights or reroute commercial traffic to perimeter bypasses before stagnation occurs.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-800 text-xs">2. Sensitive Population Health Alerts</strong>
              <p>
                Carboxyhemoglobin toxicity threatens cardiovascular and asthmatic patients. Advance warnings enable local schools, hospitals, and outdoor athletic centers to bring activities indoors prior to peak commuter waves.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-800 text-xs">3. Low-Cost Solid-State Sensor Calibration</strong>
              <p>
                Metal-oxide semiconductor sensors (<code className="font-mono">PT08.S1</code>) suffer from thermal drift. Discrepancies between predictions and sensors help identify when distributed hardware needs re-calibration.
              </p>
            </div>
          </div>
        </div>

        {/* Limitations & Failure Modes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Statistical Limitations & Failure Modes</span>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/70 space-y-1">
              <strong className="text-rose-900 text-xs">1. Underestimation of Extreme Episodes</strong>
              <p className="text-rose-950">
                Decision tree partitions cannot extrapolate beyond highest seen training bounds. For extreme spikes (<code className="font-mono">&gt;5.0 mg/m³</code>), MAE increases from 0.23 to 1.14 mg/m³, systematically under-predicting peak episodes.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-800 text-xs">2. Microclimatic Stationarity</strong>
              <p>
                The dataset represents a single fixed road-level station in Italy. Street canyon geometry and local wind tunnels mean this model cannot be deployed in other cities without local fine-tuning.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <strong className="text-slate-800 text-xs">3. Lack of Exogenous Traffic Telemetry</strong>
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
