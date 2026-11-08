import React, { useEffect, useState } from 'react';
import { Download, Filter, Info, CheckCircle2, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
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
    { name: 'Date / Time', meaning: 'Observation timestamp', unit: 'ISO Datetime', role: 'Time index / temporal features' },
    { name: 'CO(GT)', meaning: 'True reference Carbon Monoxide', unit: 'mg/m³', role: 'Predictive target (shifted) & lag feature' },
    { name: 'PT08.S1(CO)', meaning: 'Tin oxide chemical sensor nominally sensitive to CO', unit: 'Resistance (Ω)', role: 'Sensor input feature' },
    { name: 'NMHC(GT)', meaning: 'Non-Metanic Hydrocarbons', unit: 'µg/m³', role: 'Dropped (>90% missing)' },
    { name: 'C6H6(GT)', meaning: 'True reference Benzene concentration', unit: 'µg/m³', role: 'Chemical pollutant feature' },
    { name: 'PT08.S2(NMHC)', meaning: 'Titania sensor nominally sensitive to hydrocarbons', unit: 'Resistance (Ω)', role: 'Sensor input feature' },
    { name: 'NOx(GT)', meaning: 'True reference Nitrogen Oxides', unit: 'ppb', role: 'Chemical pollutant feature' },
    { name: 'PT08.S3(NOx)', meaning: 'Tungsten oxide sensor sensitive to NOx', unit: 'Resistance (Ω)', role: 'Sensor input feature' },
    { name: 'NO2(GT)', meaning: 'True reference Nitrogen Dioxide', unit: 'µg/m³', role: 'Chemical pollutant feature' },
    { name: 'PT08.S4(NO2)', meaning: 'Tungsten oxide sensor sensitive to NO2', unit: 'Resistance (Ω)', role: 'Sensor input feature' },
    { name: 'PT08.S5(O3)', meaning: 'Indium oxide sensor sensitive to Ozone', unit: 'Resistance (Ω)', role: 'Sensor input feature' },
    { name: 'T', meaning: 'Ambient Temperature', unit: '°C', role: 'Meteorological feature' },
    { name: 'RH', meaning: 'Relative Humidity', unit: '%', role: 'Meteorological feature' },
    { name: 'AH', meaning: 'Absolute Humidity', unit: 'g/m³', role: 'Meteorological feature' },
    { name: 'CO_next', meaning: 'Target: Next-hour true CO ground truth', unit: 'mg/m³', role: 'Supervised Learning Target' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Dataset Explorer</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse cleaned hourly atmospheric records, review hardware error handling, and inspect variable schemas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDictionary(!showDictionary)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Info className="w-4 h-4 text-teal-600" />
            <span>{showDictionary ? 'Hide Column Specs' : 'Column Dictionary'}</span>
          </button>
          <a
            href={api.getDownloadUrl()}
            download="cleaned_air_quality.csv"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (2.5 MB)</span>
          </a>
        </div>
      </div>

      {/* Column Dictionary Modal/Dropdown */}
      {showDictionary && (
        <div className="bg-white rounded-2xl border border-teal-200 p-6 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Dataset Variable Dictionary & Sensor Mapping</span>
            </h3>
            <span className="text-xs text-slate-400">UCI Air Quality Benchmark</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-teal-50/60 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Column</th>
                  <th className="py-2.5 px-3">Physical Meaning</th>
                  <th className="py-2.5 px-3">Physical Unit</th>
                  <th className="py-2.5 px-3">Model / Statistical Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {dictionary.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono font-semibold text-teal-900">{item.name}</td>
                    <td className="py-2 px-3">{item.meaning}</td>
                    <td className="py-2 px-3">{item.unit}</td>
                    <td className="py-2 px-3 font-medium text-slate-700">{item.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Cleansing Audit Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Missingness & Hardware Sentinel Treatment Audit</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sensors emitted <code className="text-rose-600 font-mono">-200</code> during dropouts or saturation. Below is the before-and-after audit.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Audit Complete
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {missingness.map((item) => (
            <div key={item.variable} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-800 font-mono">{item.variable}</span>
                <span className={item.raw_missing_pct > 50 ? 'text-rose-600' : 'text-amber-600'}>
                  {item.raw_missing_pct}% missing
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">Hour:</span>
              <select
                value={hourFilter}
                onChange={(e) => {
                  setHourFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All (0–23)</option>
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>
                    {i < 10 ? `0${i}` : i}:00
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Split:</span>
              <select
                value={splitFilter}
                onChange={(e) => {
                  setSplitFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Splits</option>
                <option value="train">Train Set (70%)</option>
                <option value="val">Validation Set (15%)</option>
                <option value="test">Holdout Test (15%)</option>
              </select>
            </div>

            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search datetime (e.g. 2005-02)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-52"
              />
            </div>

            {(hourFilter !== '' || splitFilter !== '' || searchTerm !== '') && (
              <button
                onClick={() => {
                  setHourFilter('');
                  setSplitFilter('');
                  setSearchTerm('');
                  setPage(1);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500">
            Total records: <strong>{data?.total_records.toLocaleString() || '...'}</strong> | Page <strong>{page}</strong> of <strong>{data?.total_pages || 1}</strong>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">DateTime</th>
                <th className="py-3 px-3">CO (mg/m³)</th>
                <th className="py-3 px-3">C6H6 (µg/m³)</th>
                <th className="py-3 px-3">NOx (ppb)</th>
                <th className="py-3 px-3">PT08.S1 (CO)</th>
                <th className="py-3 px-3">Temp (°C)</th>
                <th className="py-3 px-3">RH (%)</th>
                <th className="py-3 px-3 text-teal-700">CO_next (t+1)</th>
                <th className="py-3 px-3">Split</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading records...
                  </td>
                </tr>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-slate-900">{row.datetime}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{row['CO(GT)']}</td>
                    <td className="py-2.5 px-3">{row['C6H6(GT)']}</td>
                    <td className="py-2.5 px-3">{row['NOx(GT)']}</td>
                    <td className="py-2.5 px-3 font-mono">{row['PT08.S1(CO)']}</td>
                    <td className="py-2.5 px-3">{row['T']}°C</td>
                    <td className="py-2.5 px-3">{row['RH']}%</td>
                    <td className="py-2.5 px-3 font-bold text-teal-700">{row['CO_next']}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          row['split'] === 'train'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : row['split'] === 'val'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {row['split']}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs text-slate-500">
            Page {page} of {data?.total_pages || 1}
          </span>
          <button
            disabled={!data || page >= data.total_pages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
