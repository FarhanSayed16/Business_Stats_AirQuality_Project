import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Clock, Calendar, CloudSun, Layers, Sparkles, Activity } from 'lucide-react';
import { api } from '../api/client';
import type { HourlyPatternPoint, WeekdayPatternPoint, CorrelationData, WeatherScatterPoint } from '../types';

export const Insights: React.FC = () => {
  const [hourly, setHourly] = useState<HourlyPatternPoint[]>([]);
  const [weekday, setWeekday] = useState<WeekdayPatternPoint[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [weatherScatter, setWeatherScatter] = useState<WeatherScatterPoint[]>([]);
  const [selectedWeatherVar, setSelectedWeatherVar] = useState<'t' | 'rh' | 'ah'>('t');

  useEffect(() => {
    Promise.all([
      api.getHourlyPattern(),
      api.getWeekdayPattern(),
      api.getCorrelation(),
      api.getWeatherScatter()
    ])
      .then(([hr, wk, corr, wsc]) => {
        setHourly(hr);
        setWeekday(wk);
        setCorrelation(corr);
        setWeatherScatter(wsc);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold tracking-wide border border-teal-200 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Empirical Statistical Discoveries</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Exploratory Data Analysis & Atmospheric Rhythms
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Quantitative statistical analyses exploring diurnal traffic commute waves, weekly commercial respite, solid-state sensor fidelity, and multi-pollutant covariance.
        </p>
      </div>

      {/* 4 Core Empirical Takeaway Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card space-y-2 hover:shadow-card-hover transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Bimodal Rush-Hour Surges</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traffic generates twin daily peaks: morning commute at <strong className="text-teal-800 font-mono">8:00–9:00 AM</strong> (2.7 mg/m³) and evening peak at <strong className="text-teal-800 font-mono">6:00–8:00 PM</strong> (3.1 mg/m³).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card space-y-2 hover:shadow-card-hover transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Sunday Activity Lull</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Emissions remain high Monday through Friday, taper on Saturday, and drop by <strong className="text-sky-800">~35% on Sunday</strong> (mean 1.54 mg/m³), confirming vehicular traffic as the prime source.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card space-y-2 hover:shadow-card-hover transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Semiconductor Sensor Fidelity</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tin oxide sensor <code className="font-mono text-teal-700 bg-teal-50 px-1 rounded">PT08.S1</code> (r = <strong className="text-indigo-800">0.82</strong>) and titania <code className="font-mono text-teal-700 bg-teal-50 px-1 rounded">PT08.S2</code> (r = <strong className="text-indigo-800">0.87</strong>) show high predictive tracking with reference CO.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card space-y-2 hover:shadow-card-hover transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
            <CloudSun className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Boundary Layer Trapping</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Winter months display higher pollution accumulation due to nocturnal thermal inversions trapping automobile combustion exhaust within street canyons.
          </p>
        </div>
      </div>

      {/* Chart 1: Diurnal Hourly Cycle (Wavy Spline Profile) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Diurnal Hourly Profile of Carbon Monoxide</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hourly aggregate curve across 24 hours displaying Mean, Median, and Interquartile Range (IQR). Note the commute peaks at 8 AM and 7 PM.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto font-mono">
            <span>Bimodal Traffic Signature</span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="hour"
                tickFormatter={(hr) => `${hr < 10 ? '0' : ''}${hr}:00`}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} unit=" mg" />
              <Tooltip
                formatter={(val: any) => [`${val} mg/m³`, '']}
                labelFormatter={(hr) => `Observation Hour: ${hr}:00`}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="mean" stroke="#0d9488" strokeWidth={3} name="Mean CO(GT)" dot={{ r: 3, fill: '#0d9488' }} />
              <Line type="monotone" dataKey="median" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" name="Median CO(GT)" dot={false} />
              <Line type="monotone" dataKey="q75" stroke="#94a3b8" strokeWidth={1} name="75th Percentile" dot={false} />
              <Line type="monotone" dataKey="q25" stroke="#cbd5e1" strokeWidth={1} name="25th Percentile" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Weekday and Weather Relationships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Profile */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Weekly Distribution: Day-of-Week Variation</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compares commercial weekday congestion against weekend respite (Sunday minimum of 1.54 mg/m³).
            </p>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekday} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day_name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" mg" />
                <Tooltip
                  formatter={(val: any) => [`${val} mg/m³`, 'Mean CO']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px' }}
                />
                <Bar dataKey="mean" fill="#0d9488" radius={[6, 6, 0, 0]} name="Mean CO" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meteorological Scatter */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-600" />
                <span>Atmospheric Microclimate Coupling</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Correlation with road-level temperature & humidity.</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setSelectedWeatherVar('t')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedWeatherVar === 't' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Temp (°C)
              </button>
              <button
                onClick={() => setSelectedWeatherVar('rh')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedWeatherVar === 'rh' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Humidity (%)
              </button>
              <button
                onClick={() => setSelectedWeatherVar('ah')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  selectedWeatherVar === 'ah' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Abs Hum
              </button>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey={selectedWeatherVar}
                  name={selectedWeatherVar === 't' ? 'Temp (°C)' : selectedWeatherVar === 'rh' ? 'Relative Humidity (%)' : 'Absolute Humidity'}
                  stroke="#64748b"
                  fontSize={11}
                />
                <YAxis type="number" dataKey="co" name="CO(GT)" unit=" mg" stroke="#64748b" fontSize={11} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '12px' }}
                />
                <Scatter name="Observations" data={weatherScatter} fill="#0284c7" fillOpacity={0.45} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Multi-Pollutant Correlation Heatmap */}
      {correlation && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Multi-Pollutant & Sensor Correlation Matrix (Pearson r)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pairwise correlation coefficients among reference gas analyzers, solid-state semiconductor sensors, and meteorological variables.
            </p>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-center text-[11px] font-mono">
              <thead>
                <tr>
                  <th className="py-2.5 px-3 text-left font-sans font-semibold text-slate-600 uppercase tracking-wider">Feature</th>
                  {correlation.columns.map((c) => (
                    <th key={c} className="py-2.5 px-1 font-medium text-slate-600 truncate max-w-[70px]">
                      {c.replace('(GT)', '').replace('PT08.', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlation.columns.map((rowName, rIdx) => (
                  <tr key={rowName} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-left font-semibold text-slate-800 truncate max-w-[120px]">
                      {rowName}
                    </td>
                    {correlation.columns.map((_, cIdx) => {
                      const val = correlation.matrix[rIdx][cIdx];
                      const isHighPos = val >= 0.7;
                      const isModPos = val >= 0.4 && val < 0.7;
                      const isHighNeg = val <= -0.5;

                      const bgClass =
                        isHighPos
                          ? 'bg-teal-600 text-white font-bold'
                          : isModPos
                          ? 'bg-teal-100 text-teal-900 font-medium'
                          : isHighNeg
                          ? 'bg-rose-500 text-white font-bold'
                          : val < 0
                          ? 'bg-rose-50 text-rose-800'
                          : 'bg-slate-50 text-slate-700';

                      return (
                        <td key={cIdx} className="p-1">
                          <span className={`block py-1 px-1 rounded-md text-[10px] ${bgClass}`}>
                            {val.toFixed(2)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
