import React, { useEffect, useState } from 'react';
import {
  Clock, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Sparkles, RefreshCw,
  Sliders, History, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { api } from '../api/client';
import type { SampleTimestamp, PredictionResult } from '../types';

export const Predict: React.FC = () => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [samples, setSamples] = useState<SampleTimestamp[]>([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string>('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom Simulator State
  const [customCO, setCustomCO] = useState<number>(2.5);
  const [customTemp, setCustomTemp] = useState<number>(18.0);
  const [customRH, setCustomRH] = useState<number>(50.0);
  const [customSensor, setCustomSensor] = useState<number>(1100);
  const [customHour, setCustomHour] = useState<number>(18);

  useEffect(() => {
    api.getSampleTimestamps(60)
      .then((data) => {
        setSamples(data);
        if (data.length > 0) {
          setSelectedTimestamp(data[0].datetime);
          handlePredictPreset(data[0].datetime);
        }
      })
      .catch(console.error);
  }, []);

  const handlePredictPreset = async (dt: string) => {
    if (!dt) return;
    setLoading(true);
    try {
      const res = await api.predict({ datetime_str: dt });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictCustom = async () => {
    setLoading(true);
    try {
      const res = await api.predict({
        custom_features: {
          'CO(GT)': customCO,
          'T': customTemp,
          'RH': customRH,
          'PT08.S1(CO)': customSensor,
          'hour': customHour
        }
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyPresetScenario = (co: number, temp: number, rh: number, sensor: number, hr: number) => {
    setCustomCO(co);
    setCustomTemp(temp);
    setCustomRH(rh);
    setCustomSensor(sensor);
    setCustomHour(hr);
  };

  const getSeverity = (co: number) => {
    if (co < 2.0) {
      return {
        label: 'Good (Low Public Risk)',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCircle2,
        action: 'Normal baseline operations. Ambient air quality within safe WHO guidelines.'
      };
    } else if (co < 4.0) {
      return {
        label: 'Moderate Urban Exposure',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: AlertTriangle,
        action: 'Commute wave accumulating. Advise dynamic signal phasing to minimize idling at arterial intersections.'
      };
    } else if (co < 6.0) {
      return {
        label: 'Unhealthy for Sensitive Groups',
        color: 'bg-orange-50 text-orange-800 border-orange-200',
        icon: AlertTriangle,
        action: 'Dispatch health alert to local schools, elderly care, and outdoor athletic centers to curtail strenuous activity.'
      };
    } else {
      return {
        label: 'Hazardous Episode Alert',
        color: 'bg-rose-50 text-rose-800 border-rose-200',
        icon: ShieldAlert,
        action: 'Severe stagnation episode. Trigger municipal traffic rerouting and perimeter bypass diversions.'
      };
    }
  };

  const sev = result ? getSeverity(result.predicted_co_next) : null;
  const SevIcon = sev?.icon;
  const delta = result ? result.predicted_co_next - (result.current_co || 0) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold tracking-wide border border-teal-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Real-Time Atmospheric Inference Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Lab — 1-Hour Carbon Monoxide Predictor
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Forecast next-hour Carbon Monoxide ground truth (<code className="font-mono text-teal-800 bg-teal-50 px-1 rounded">CO_next</code>) using the champion HistGradientBoosting model. Replay historical holdout hours or simulate custom scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Prediction Controls & Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => {
                setMode('preset');
                if (selectedTimestamp) handlePredictPreset(selectedTimestamp);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                mode === 'preset'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historical Holdout Replay</span>
            </button>

            <button
              onClick={() => {
                setMode('custom');
                handlePredictCustom();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                mode === 'custom'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>What-If Atmosphere Simulator</span>
            </button>
          </div>

          {/* Mode 1: Historical Preset Controls */}
          {mode === 'preset' ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-slate-900">Select Historical Holdout Hour</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                  Untouched Test Partition
                </span>
              </div>

              <div className="space-y-3">
                <select
                  value={selectedTimestamp}
                  onChange={(e) => {
                    setSelectedTimestamp(e.target.value);
                    handlePredictPreset(e.target.value);
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors shadow-sm"
                >
                  {samples.map((s) => (
                    <option key={s.datetime} value={s.datetime}>
                      {s.datetime} — Current CO: {s.current_co} mg/m³ (T: {s.temperature}°C, RH: {s.humidity}%)
                    </option>
                  ))}
                </select>

                <button
                  disabled={loading}
                  onClick={() => handlePredictPreset(selectedTimestamp)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Execute Next-Hour Prediction</span>
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: Interactive What-If Atmosphere Simulator */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-card space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-slate-900">Atmospheric What-If Simulator</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Custom Sensor Injection
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Atmospheric Scenarios:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => { applyPresetScenario(3.5, 16.0, 65.0, 1400, 8); }}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-400 text-left transition-colors shadow-sm"
                  >
                    <div className="text-[11px] font-bold text-teal-800">Morning Rush</div>
                    <div className="text-[10px] text-slate-500 font-mono">08:00 • 3.5 mg/m³</div>
                  </button>
                  <button
                    onClick={() => { applyPresetScenario(4.2, 19.0, 50.0, 1550, 19); }}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 text-left transition-colors shadow-sm"
                  >
                    <div className="text-[11px] font-bold text-amber-800">Evening Peak</div>
                    <div className="text-[10px] text-slate-500 font-mono">19:00 • 4.2 mg/m³</div>
                  </button>
                  <button
                    onClick={() => { applyPresetScenario(1.1, 12.0, 75.0, 850, 3); }}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-400 text-left transition-colors shadow-sm"
                  >
                    <div className="text-[11px] font-bold text-sky-800">Sunday Low</div>
                    <div className="text-[10px] text-slate-500 font-mono">03:00 • 1.1 mg/m³</div>
                  </button>
                  <button
                    onClick={() => { applyPresetScenario(6.8, 4.0, 85.0, 1780, 21); }}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-rose-400 text-left transition-colors shadow-sm"
                  >
                    <div className="text-[11px] font-bold text-rose-800">Winter Inversion</div>
                    <div className="text-[10px] text-slate-500 font-mono">21:00 • 6.8 mg/m³</div>
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Current CO */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Current Reference CO</span>
                    <span className="font-mono font-bold text-teal-800">{customCO.toFixed(1)} mg/m³</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="10.0"
                    step="0.1"
                    value={customCO}
                    onChange={(e) => setCustomCO(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.2 (Clean)</span>
                    <span>10.0 (Severe)</span>
                  </div>
                </div>

                {/* Tin Oxide Sensor Resistance */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">PT08.S1 Sensor Resistance</span>
                    <span className="font-mono font-bold text-sky-800">{customSensor} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="2000"
                    step="10"
                    value={customSensor}
                    onChange={(e) => setCustomSensor(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>500 Ω (Low response)</span>
                    <span>2000 Ω (High response)</span>
                  </div>
                </div>

                {/* Ambient Temperature */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Ambient Temperature</span>
                    <span className="font-mono font-bold text-amber-800">{customTemp.toFixed(1)} °C</span>
                  </div>
                  <input
                    type="range"
                    min="-5.0"
                    max="45.0"
                    step="0.5"
                    value={customTemp}
                    onChange={(e) => setCustomTemp(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>-5 °C (Winter)</span>
                    <span>45 °C (Summer)</span>
                  </div>
                </div>

                {/* Relative Humidity */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Relative Humidity</span>
                    <span className="font-mono font-bold text-indigo-800">{customRH.toFixed(0)} %</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    step="1"
                    value={customRH}
                    onChange={(e) => setCustomRH(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>10% (Dry)</span>
                    <span>95% (Humid/Rain)</span>
                  </div>
                </div>

                {/* Hour of Day */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Observation Hour of Day</span>
                    <span className="font-mono font-bold text-teal-800">{customHour < 10 ? `0${customHour}` : customHour}:00</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={customHour}
                    onChange={(e) => setCustomHour(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>00:00 (Midnight)</span>
                    <span>12:00 (Noon)</span>
                    <span>23:00 (Night)</span>
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                onClick={handlePredictCustom}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Next-Hour CO with Custom Parameters</span>
              </button>
            </div>
          )}

          {/* Prediction Result Display HUD (Matching BreatheairMind Card Aesthetic) */}
          {result && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-card space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                    Forecast Target
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    Next-Hour Ground Truth (<code className="font-mono text-teal-800">CO_next</code> at Hour t + 1)
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {mode === 'preset' ? `Timestamp: ${result.datetime}` : 'Custom Atmosphere Simulation'}
                  </p>
                </div>

                {sev && (
                  <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-sm ${sev.color}`}>
                    {SevIcon && <SevIcon className="w-4 h-4" />}
                    <span>{sev.label}</span>
                  </div>
                )}
              </div>

              {/* HUD Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Predicted Next CO */}
                <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 text-center space-y-1">
                  <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">Forecasted Next CO</div>
                  <div className="text-4xl font-black text-teal-900 font-mono tracking-tight">
                    {result.predicted_co_next} <span className="text-sm font-normal text-teal-700 font-sans">mg/m³</span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-mono">
                    Confidence: ±0.36 mg/m³
                  </div>
                </div>

                {/* Rate of Change / Delta */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1-Hour Trajectory</div>
                  <div className={`text-2xl font-black font-mono flex items-center justify-center gap-1 ${delta >= 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {delta >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    <span>{delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}</span>
                    <span className="text-xs font-normal text-slate-500 font-sans">mg</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Current: {result.current_co || customCO} mg/m³
                  </div>
                </div>

                {/* Ground Truth or Error */}
                <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 text-center space-y-1">
                  <div className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                    {mode === 'preset' ? 'Actual Observed Next CO' : 'Simulated Drift'}
                  </div>
                  <div className="text-2xl font-black text-sky-900 font-mono">
                    {mode === 'preset' ? (
                      <>
                        {result.actual_co_next} <span className="text-xs font-normal text-sky-700 font-sans">mg/m³</span>
                      </>
                    ) : (
                      <>
                        {((result.predicted_co_next / customCO - 1) * 100).toFixed(1)}%
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono">
                    {mode === 'preset' ? (
                      <>
                        Error: <strong className={result.abs_error! < 0.4 ? 'text-emerald-700' : 'text-amber-700'}>
                          ±{result.abs_error} mg/m³
                        </strong>
                      </>
                    ) : (
                      'Forecasted relative shift'
                    )}
                  </div>
                </div>
              </div>

              {/* Contextual Real-Time Municipal Recommendation (Health Tips) */}
              {sev && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Municipal Health & Traffic Advisory: </strong>
                    <span>{sev.action}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Model Specs Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>Champion Architecture & Tuning</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Deployed Algorithm</span>
                <div className="font-bold text-slate-900 font-mono">HistGradientBoostingRegressor</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Histogram-binned gradient-boosted decision trees designed for non-linear regression with native missingness resilience.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-slate-500 font-medium">Optimal Hyperparameters (5-Fold CV)</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-teal-900 font-semibold shadow-sm">
                    learning_rate: 0.1
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-teal-900 font-semibold shadow-sm">
                    max_iter: 100
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-teal-900 font-semibold shadow-sm">
                    max_depth: 10
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-teal-900 font-semibold shadow-sm">
                    min_samples: 20
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Anti-Leakage Certified</span>
                </div>
                <p className="text-[11px] text-teal-700 leading-relaxed">
                  Strict chronological train/val/test splits. Features strictly use information available up to observation hour <strong className="font-mono text-teal-900">t</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
