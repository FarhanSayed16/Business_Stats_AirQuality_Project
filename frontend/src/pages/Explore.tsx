import React, { useEffect, useState } from 'react';
import { Download, Filter, Info, CheckCircle2, ChevronLeft, ChevronRight, Search, X, Layers, Database } from 'lucide-react';
import { api } from '../api/client';
import type { PaginatedData, MissingnessItem } from '../types';

export const Explore: React.FC = () => {
  const [data, setData] = useState<PaginatedData | null>(null);
  const [missingness, setMissingness] = useState<MissingnessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hourFilter, setHourFilter] = useState<string>('');
  const [splitFilter, setSplitFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDictionary, setShowDictionary] = useState(false);

  useEffect(() => {
    api.getMissingness().then(setMissingness).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const hourNum = hourFilter !== '' ? parseInt(hourFilter, 10) : undefined;
    const splitVal = splitFilter !== '' ? splitFilter : undefined;
    const searchVal = searchTerm.trim() !== '' ? searchTerm.trim() : undefined;

    api.getDataRows(page, 20, undefined, undefined, hourNum, splitVal, searchVal)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [page, hourFilter, splitFilter, searchTerm]);

  const dictionary = [
    { name: 'DateTime', meaning: 'Observation timestamp (Hourly frequency)', unit: 'ISO YYYY-MM-DD HH:MM', role: 'Time index / temporal encodings' },
    { name: 'CO(GT)', meaning: 'True reference Carbon Monoxide ground truth', unit: 'mg/m³', role: 'Predictive target & primary lag feature' },
    { name: 'PT08.S1(CO)', meaning: 'Tin oxide semiconductor sensor (nominally sensitive to CO)', unit: 'Resistance (Ω)', role: 'Chemical sensor input feature' },
    { name: 'NMHC(GT)', meaning: 'Non-Metanic Hydrocarbons concentration', unit: 'µg/m³', role: 'Dropped (90.2% missingness)' },
    { name: 'C6H6(GT)', meaning: 'True reference Benzene concentration', unit: 'µg/m³', role: 'Aromatic hydrocarbon input feature' },
    { name: 'PT08.S2(NMHC)', meaning: 'Titania semiconductor sensor sensitive to hydrocarbons', unit: 'Resistance (Ω)', role: 'Chemical sensor input feature' },
    { name: 'NOx(GT)', meaning: 'True reference Nitrogen Oxides concentration', unit: 'ppb', role: 'Combustion exhaust co-pollutant' },
    { name: 'PT08.S3(NOx)', meaning: 'Tungsten oxide sensor sensitive to NOx', unit: 'Resistance (Ω)', role: 'Oxidising gas sensor input' },
    { name: 'NO2(GT)', meaning: 'True reference Nitrogen Dioxide concentration', unit: 'µg/m³', role: 'Chemical pollutant feature' },
    { name: 'PT08.S4(NO2)', meaning: 'Tungsten oxide sensor sensitive to NO2', unit: 'Resistance (Ω)', role: 'Chemical sensor input feature' },
    { name: 'PT08.S5(O3)', meaning: 'Indium oxide sensor sensitive to Ozone', unit: 'Resistance (Ω)', role: 'Photochemical oxidant sensor' },
    { name: 'T', meaning: 'Ambient Temperature at road level', unit: '°C', role: 'Meteorological input feature' },
    { name: 'RH', meaning: 'Relative Humidity', unit: '%', role: 'Meteorological input feature' },
    { name: 'AH', meaning: 'Absolute Humidity', unit: 'g/m³', role: 'Meteorological input feature' },
    { name: 'CO_next', meaning: 'Target: Next-hour true CO ground-truth concentration', unit: 'mg/m³', role: 'Supervised Learning Regression Target' },
  ];

  const getCoColorClass = (val: number) => {
    if (val < 2.0) return 'text-emerald-400 font-medium';
    if (val < 4.0) return 'text-amber-400 font-semibold';
    return 'text-rose-400 font-bold';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/20 mb-2">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Cleaned Atmospheric Telemetry Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dataset Explorer</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Browse 9,353 cleaned hourly observations from the road-level Italian monitoring station. Inspect hardware error treatment, evaluate partitions, and verify anti-leakage feature sets.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setShowDictionary(!showDictionary)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold transition-all shadow-md hover:bg-slate-850"
          >
            <Info className="w-4 h-4 text-teal-400" />
            <span>{showDictionary ? 'Hide Schema' : 'Column Schema'}</span>
          </button>
          <a
            href={api.getDownloadUrl()}
            download="cleaned_air_quality.csv"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-teal-500/20 hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV (2.5 MB)</span>
          </a>
        </div>
      </div>

      {/* Column Dictionary Modal/Dropdown */}
      {showDictionary && (
        <div className="bg-[#0b1220]/90 backdrop-blur-xl rounded-2xl border border-teal-500/40 p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-400" />
              <span>Dataset Variable Dictionary & Sensor Mapping</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">UCI Air Quality Benchmark</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Physical Meaning</th>
                  <th className="py-2.5 px-3">Physical Unit</th>
                  <th className="py-2.5 px-3">Model / Statistical Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {dictionary.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 font-mono font-semibold text-teal-300">{item.name}</td>
                    <td className="py-2 px-3">{item.meaning}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{item.unit}</td>
                    <td className="py-2 px-3 font-medium text-slate-300">{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Missingness & Hardware Sentinel Treatment Audit */}
      <div className="bg-[#0b1220]/70 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Missingness & Hardware Sentinel Treatment Audit</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sensors emitted hardware sentinel <code className="text-rose-400 font-mono">-200</code> during power dropouts or sensor saturation. All sentinels sanitized before analysis.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Audit Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {missingness.map((item) => (
            <div key={item.variable} className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs space-y-1.5 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-200 font-mono text-xs">{item.variable}</span>
                <span className={`font-mono text-xs ${item.raw_missing_pct > 50 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {item.raw_missing_pct}% raw missing
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Data Table Station */}
      <div className="bg-[#0b1220]/70 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
        {/* Table Filters Toolbar */}
        <div className="p-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Split Filter Chips */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => { setSplitFilter(''); setPage(1); }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  splitFilter === ''
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Splits
              </button>
              <button
                onClick={() => { setSplitFilter('train'); setPage(1); }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  splitFilter === 'train'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Train (70%)
              </button>
              <button
                onClick={() => { setSplitFilter('val'); setPage(1); }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  splitFilter === 'val'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Val (15%)
              </button>
              <button
                onClick={() => { setSplitFilter('test'); setPage(1); }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  splitFilter === 'test'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Holdout Test (15%)
              </button>
            </div>

            {/* Hour Selector */}
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-400">Hour:</span>
              <select
                value={hourFilter}
                onChange={(e) => {
                  setHourFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-transparent text-slate-200 font-mono font-medium focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-200">All (0–23)</option>
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i} className="bg-slate-900 text-slate-200">
                    {i < 10 ? `0${i}` : i}:00
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search datetime (e.g. 2005-02)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 w-56"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Clear All Filters */}
            {(hourFilter !== '' || splitFilter !== '' || searchTerm !== '') && (
              <button
                onClick={() => {
                  setHourFilter('');
                  setSplitFilter('');
                  setSearchTerm('');
                  setPage(1);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Records: <strong className="text-white">{data?.total_records.toLocaleString() || '...'}</strong> | Page <strong className="text-teal-300">{page}</strong> of <strong className="text-slate-300">{data?.total_pages || 1}</strong>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Observation Timestamp</th>
                <th className="py-3 px-3">CO (mg/m³)</th>
                <th className="py-3 px-3">C6H6 (µg/m³)</th>
                <th className="py-3 px-3">NOx (ppb)</th>
                <th className="py-3 px-3">PT08.S1 Sensor</th>
                <th className="py-3 px-3">Temp (°C)</th>
                <th className="py-3 px-3">RH (%)</th>
                <th className="py-3 px-3 text-teal-300 font-bold">CO_next (Target)</th>
                <th className="py-3 px-3">Partition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500 font-sans">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading atmospheric observations...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-teal-500/[0.04] transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-200">{row.datetime}</td>
                    <td className={`py-2.5 px-3 ${getCoColorClass(row['CO(GT)'])}`}>{row['CO(GT)']}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row['C6H6(GT)']}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row['NOx(GT)']}</td>
                    <td className="py-2.5 px-3 text-cyan-300">{row['PT08.S1(CO)']}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row['T']}°C</td>
                    <td className="py-2.5 px-3 text-slate-300">{row['RH']}%</td>
                    <td className="py-2.5 px-3 font-bold text-teal-300">
                      <span className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/30">
                        {row['CO_next']}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          row['split'] === 'train'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : row['split'] === 'val'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {row['split']}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-500 font-sans">
                    No atmospheric records found matching the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/60 font-mono text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-800 text-slate-300 bg-slate-950/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-sans">Previous</span>
          </button>
          <span className="text-slate-400 font-sans">
            Page <strong className="text-teal-300 font-mono">{page}</strong> of <strong className="text-slate-300 font-mono">{data?.total_pages || 1}</strong>
          </span>
          <button
            disabled={!data || page >= data.total_pages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-800 text-slate-300 bg-slate-950/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="font-sans">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
