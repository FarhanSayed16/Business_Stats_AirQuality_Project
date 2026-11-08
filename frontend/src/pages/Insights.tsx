import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Clock, Calendar, CloudSun, Layers } from 'lucide-react';
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Exploratory Data Analysis & Empirical Insights
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quantitative statistical analyses exploring temporal dynamics, commuter rhythms, sensor sensitivity, and weather correlations.
        </p>
      </div>

      {/* 4 Core Insight Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-teal-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Bimodal Rush-Hour Waves</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Traffic generates two intense daily surges: morning commute at <strong>8:00–9:00 AM</strong> (2.7 mg/m³) and evening peak at <strong>6:00–8:00 PM</strong> (3.1 mg/m³).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
            <Calendar className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Sunday Activity Lull</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Emissions remain uniformly high Monday through Friday, taper moderately on Saturday, and reach their weekly minimum on <strong>Sunday</strong> (mean drops to 1.5 mg/m³).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">High Sensor Proxy Fidelity</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Solid-state tin oxide sensor <code className="font-mono text-xs">PT08.S1</code> (r = <strong>0.82</strong>) and titania <code className="font-mono text-xs">PT08.S2</code> (r = <strong>0.87</strong>) correlate tightly with ground-truth CO.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            <CloudSun className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Thermal Inversion Trapping</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Winter months (Nov–Feb) display the highest pollution episodes due to shallow atmospheric boundary layers trapping road emissions at ground level.
          </p>
        </div>
      </div>

      {/* Chart 1: Diurnal Hourly Cycle */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Diurnal Cycle: Hourly Profile of Carbon Monoxide
            </h3>
            <p className="text-xs text-slate-500">
              Average concentration across the 24-hour day with interquartile range (IQR). Note the twin traffic commute peaks.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start">
            <span>Bimodal Traffic Signature</span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="hour"
                tickFormatter={(hr) => `${hr}:00`}
                stroke="#64748b"
                fontSize={11}
              />
              <YAxis stroke="#64748b" fontSize={11} unit=" mg/m³" />
              <Tooltip
                formatter={(val: any) => [`${val} mg/m³`, '']}
                labelFormatter={(hr) => `Hour: ${hr}:00`}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="mean" stroke="#0f766e" strokeWidth={3} name="Mean CO(GT)" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="median" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" name="Median CO(GT)" dot={false} />
              <Line type="monotone" dataKey="q75" stroke="#94a3b8" strokeWidth={1} name="75th Percentile" dot={false} />
              <Line type="monotone" dataKey="q25" stroke="#cbd5e1" strokeWidth={1} name="25th Percentile" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Weekday vs Weekend Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Weekly Distribution: Day-of-Week Pollution
            </h3>
            <p className="text-xs text-slate-500">
              Compares commercial weekday pollution against weekend respite (Sunday minimum).
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
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="mean" fill="#0d9488" radius={[6, 6, 0, 0]} name="Mean CO" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Weather Scatter Relationships */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Meteorological Relationships</h3>
              <p className="text-xs text-slate-500">Examine how CO levels vary with atmospheric conditions.</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setSelectedWeatherVar('t')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  selectedWeatherVar === 't' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Temp (°C)
              </button>
              <button
                onClick={() => setSelectedWeatherVar('rh')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  selectedWeatherVar === 'rh' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Humidity (%)
              </button>
              <button
                onClick={() => setSelectedWeatherVar('ah')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  selectedWeatherVar === 'ah' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'
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
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Scatter name="Observations" data={weatherScatter} fill="#0284c7" fillOpacity={0.4} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Correlation Heatmap Grid */}
      {correlation && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Correlation Heatmap Matrix</h3>
            <p className="text-xs text-slate-500">
              Pairwise Pearson correlation coefficients among pollutants, semiconductor sensors, and meteorological variables.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-[11px]">
              <thead>
                <tr>
                  <th className="py-2 px-2 text-left font-semibold text-slate-500">Feature</th>
                  {correlation.columns.map((c) => (
                    <th key={c} className="py-2 px-1 font-mono font-medium text-slate-600 truncate max-w-[70px]">
                      {c.replace('(GT)', '').replace('PT08.', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlation.columns.map((rowName, rIdx) => (
                  <tr key={rowName} className="border-t border-slate-100">
                    <td className="py-2 px-2 text-left font-mono font-semibold text-slate-800 truncate max-w-[100px]">
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
                          <span className={`block py-1 px-1 rounded text-[10px] ${bgClass}`}>
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
