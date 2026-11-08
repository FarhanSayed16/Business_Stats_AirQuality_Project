import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, Sparkles, RefreshCw, Sliders, History } from 'lucide-react';
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

  const getSeverity = (co: number) => {
    if (co < 2.0) {
      return { label: 'Good (Low Risk)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    } else if (co < 4.0) {
      return { label: 'Moderate Exposure', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle };
    } else if (co < 6.0) {
      return { label: 'Unhealthy for Sensitive', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle };
    } else {
      return { label: 'Hazardous Episode', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldAlert };
    }
  };

  const sev = result ? getSeverity(result.predicted_co_next) : null;
  const SevIcon = sev?.icon;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Lab — Real-Time Next-Hour Predictor
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Simulate next-hour Carbon Monoxide concentration (<code className="font-mono text-slate-700">CO_next</code>) using the tuned HistGradientBoosting regression model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interactive Prediction Controls & Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => {
                setMode('preset');
                if (selectedTimestamp) handlePredictPreset(selectedTimestamp);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'preset'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>1. Historical Test Samples</span>
            </button>

            <button
              onClick={() => {
                setMode('custom');
                handlePredictCustom();
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'custom'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>2. What-If Scenario Simulator</span>
            </button>
          </div>

          {/* Mode 1: Timestamp Selector Card */}
          {mode === 'preset' ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Select Historical Holdout Test Timestamp</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  Untouched Test Partition
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedTimestamp}
                  onChange={(e) => {
                    setSelectedTimestamp(e.target.value);
                    handlePredictPreset(e.target.value);
                  }}
                  className="flex-1 text-sm bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {samples.map((s) => (
                    <option key={s.datetime} value={s.datetime}>
                      {s.datetime} — Current CO: {s.current_co} mg/m³ ({s.temperature}°C, {s.humidity}%)
                    </option>
                  ))}
                </select>

                <button
                  disabled={loading}
                  onClick={() => handlePredictPreset(selectedTimestamp)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Run Forecast</span>
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: Interactive What-If Scenario Sliders */
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <span>Interactive Parameter Simulator</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                  Custom What-If Inputs
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Initial CO */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">Initial CO(GT) Level:</span>
                    <span className="font-mono text-teal-700 font-bold">{customCO.toFixed(1)} mg/m³</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.1"
                    value={customCO}
                    onChange={(e) => setCustomCO(parseFloat(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.5 mg/m³</span>
                    <span>10.0 mg/m³</span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">Ambient Temperature:</span>
                    <span className="font-mono text-sky-700 font-bold">{customTemp.toFixed(1)}°C</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="0.5"
                    value={customTemp}
                    onChange={(e) => setCustomTemp(parseFloat(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0°C (Winter)</span>
                    <span>40°C (Summer)</span>
                  </div>
                </div>

                {/* Relative Humidity */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">Relative Humidity:</span>
                    <span className="font-mono text-indigo-700 font-bold">{customRH.toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="85"
                    step="1"
                    value={customRH}
                    onChange={(e) => setCustomRH(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>15% (Dry)</span>
                    <span>85% (Humid)</span>
                  </div>
                </div>

                {/* Hour of Day */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">Hour of Day (Rush Hour):</span>
                    <span className="font-mono text-amber-700 font-bold">{customHour}:00</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="23"
                    step="1"
                    value={customHour}
                    onChange={(e) => setCustomHour(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>00:00 (Midnight)</span>
                    <span>18:00 (Evening Rush)</span>
                    <span>23:00</span>
                  </div>
                </div>

                {/* PT08.S1 Sensor Resistance */}
                <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">Tin Oxide Sensor PT08.S1 Resistance:</span>
                    <span className="font-mono text-purple-700 font-bold">{customSensor} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="1800"
                    step="25"
                    value={customSensor}
                    onChange={(e) => setCustomSensor(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>600 Ω (Low response)</span>
                    <span>1100 Ω (Normal mean)</span>
                    <span>1800 Ω (High response)</span>
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                onClick={handlePredictCustom}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Next-Hour CO with Custom Parameters</span>
              </button>
            </div>
          )}

          {/* Prediction Result Display */}
          {result && (
            <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Forecast Horizon</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    1 Hour Ahead (Hour t + 1)
                  </div>
                  <p className="text-xs text-slate-500">
                    {mode === 'preset' ? `Timestamp: ${result.datetime}` : 'Custom Simulation Scenario'}
                  </p>
                </div>

                {sev && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border self-start ${sev.color}`}>
                    {SevIcon && <SevIcon className="w-4 h-4" />}
                    <span>{sev.label}</span>
                  </div>
                )}
              </div>

              {/* Main Comparison Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Current Hour CO(GT)</div>
                  <div className="text-2xl font-extrabold text-slate-800">
                    {result.current_co} <span className="text-xs font-normal text-slate-500">mg/m³</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Persistence Baseline</div>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-300 text-center">
                  <div className="text-xs font-semibold text-teal-800 mb-1">Predicted Next-Hour CO</div>
                  <div className="text-3xl font-extrabold text-teal-700">
                    {result.predicted_co_next} <span className="text-xs font-normal text-teal-600">mg/m³</span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-medium mt-1">HistGradientBoosting</div>
                </div>

                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-center">
                  <div className="text-xs font-semibold text-sky-800 mb-1">
                    {mode === 'preset' ? 'Actual Observed Next CO' : 'Expected Next Shift'}
                  </div>
                  <div className="text-2xl font-extrabold text-sky-800">
                    {mode === 'preset' ? (
                      <>
                        {result.actual_co_next} <span className="text-xs font-normal text-sky-600">mg/m³</span>
                      </>
                    ) : (
                      <>
                        {(result.predicted_co_next - (result.current_co || 0)) > 0 ? '+' : ''}
                        {(result.predicted_co_next - (result.current_co || 0)).toFixed(2)} <span className="text-xs font-normal text-sky-600">mg/m³</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {mode === 'preset' ? (
                      <>
                        Error: <strong className={result.abs_error! < 0.4 ? 'text-emerald-600' : 'text-amber-600'}>
                          ±{result.abs_error} mg/m³
                        </strong>
                      </>
                    ) : (
                      'Simulated Rate of Change'
                    )}
                  </div>
                </div>
              </div>

              {/* Key Features Fed to Model */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Key Input Features at Observation Hour (t)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">PT08.S1 (CO)</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_used['PT08.S1(CO)']} Ω</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">PT08.S2 (NMHC)</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_used['PT08.S2(NMHC)']} Ω</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Benzene C6H6</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_used['C6H6(GT)']} µg/m³</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Nitrogen Oxides NOx</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_used['NOx(GT)']} ppb</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Temperature</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_used['T']}°C</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Relative Humidity</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_used['RH']}%</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Lag 1 CO(t-1)</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_used['CO_lag1']} mg/m³</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Rolling 3h Mean</span>
                    <span className="font-mono font-bold text-slate-800">{result.features_used['CO_rolling_mean_3h']} mg/m³</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Model Architecture & Specifications */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>Model Architecture & Tuning</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 font-medium">Model Algorithm</span>
                <div className="font-bold text-slate-900">HistGradientBoostingRegressor</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 font-medium">Optimal Parameters (5-Fold TimeSeriesSplit)</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-mono">
                  <li>learning_rate: 0.1</li>
                  <li>max_iter: 100</li>
                  <li>max_depth: 10</li>
                  <li>min_samples_leaf: 20</li>
                  <li>l2_regularization: 0.5</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                <span className="text-slate-500 font-medium">Anti-Leakage Safeguard</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Strictly chronological train/validation/test partitions. Features include only current and historical lags up to hour <code className="font-mono text-slate-800">t</code>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                <span className="text-teal-800 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Performance Gain</span>
                </span>
                <p className="text-teal-900 text-[11px]">
                  Reduces RMSE by <strong>30.5%</strong> over the persistence baseline on the holdout test set with an R² of <strong>0.834</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
