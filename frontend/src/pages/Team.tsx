import React from 'react';
import { Users, Code2, Server, Layout, CheckCircle2, GitBranch, Cpu, Database } from 'lucide-react';

export const Team: React.FC = () => {
  const members = [
    {
      name: 'Farhan Sayed (Data & Architecture Lead)',
      role: 'Member A / D — Data Lead & System Architect',
      responsibilities: [
        'Raw dataset ingestion, semicolon/comma delimiter handling, and -200 hardware sentinel filtering',
        'Time-aware imputation and chronological split masking (70% Train, 15% Val, 15% Test)',
        'FastAPI backend architecture, REST endpoints, and serialized model artifact serving',
        'Vite + React + Tailwind dashboard engineering and production containerization'
      ]
    },
    {
      name: 'Group 3 Team Member (EDA & Analytics Lead)',
      role: 'Member B — Statistical & EDA Lead',
      responsibilities: [
        'Univariate summary statistics (parametric central tendencies, skewness, and kurtosis)',
        'Diurnal (hourly) rush-hour cycle characterization and weekend vs weekday comparisons',
        'Meteorological correlation analysis (Temperature, Relative Humidity, Absolute Humidity)',
        'Publication-quality visualization generation and academic report EDA narrative'
      ]
    },
    {
      name: 'Group 3 Team Member (Predictive Modelling Lead)',
      role: 'Member C — Machine Learning Lead',
      responsibilities: [
        'Formulation of next-hour target (CO_next) with strict anti-leakage temporal policies',
        'Baseline persistence calibration and standardized Linear/Ridge regression analysis',
        '5-fold TimeSeriesSplit cross-validation for HistGradientBoostingRegressor hyperparameter tuning',
        'Holdout test set evaluation (RMSE, MAE, R²) and artifact serialization (model.joblib, metrics.json)'
      ]
    }
  ];

  const techStack = [
    { name: 'Python 3.12', category: 'Core Academic Stack', desc: 'Preprocessing, statistical modelling, and evaluation' },
    { name: 'FastAPI & Uvicorn', category: 'Backend Presentation Layer', desc: 'High-performance asynchronous REST API service' },
    { name: 'Scikit-Learn', category: 'Machine Learning', desc: 'HistGradientBoosting, Ridge, TimeSeriesSplit CV' },
    { name: 'React 19 & TypeScript', category: 'Frontend Interface', desc: 'Type-safe interactive dashboard application' },
    { name: 'Vite & Tailwind CSS', category: 'Build & Styling Toolchain', desc: 'Blazing-fast bundler and responsive utility styling' },
    { name: 'Recharts', category: 'Data Visualization', desc: 'Interactive timeseries, bar charts, and scatter plots' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Project Team & Architecture Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          MCA I Statistics Internal Assessment — <strong>Group 3: Air Quality and Pollution</strong>
        </p>
      </div>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">{m.name}</h3>
                <p className="text-xs font-semibold text-teal-600 mt-0.5">{m.role}</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Key Contributions:</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {m.responsibilities.map((r, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dual-Layer Architecture Blueprint */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-teal-600" />
          <span>End-to-End System Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-600" />
              <span>1. Academic Core</span>
            </div>
            <p className="text-slate-500">
              Raw UCI dataset parsed, -200 sentinels treated, NMHC dropped, time-aware interpolation applied, 70/15/15 chronological split saved.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-sky-600" />
              <span>2. Model Calibration</span>
            </div>
            <p className="text-slate-500">
              Target shift (CO_next), autoregressive lags, 5-fold TimeSeriesSplit tuning, serialized into model.joblib & metrics.json.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>3. FastAPI Backend</span>
            </div>
            <p className="text-slate-500">
              Caches data & model, serves /stats, /data, /model/predict with CORS for live interactive client consumption.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-emerald-600" />
              <span>4. React Dashboard</span>
            </div>
            <p className="text-slate-500">
              Vite + TS + Tailwind + Recharts UI delivering 6 interactive presentation pages for classroom demo and viva defense.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-teal-600" />
          <span>Technology Stack & Frameworks</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {techStack.map((tech) => (
            <div key={tech.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{tech.name}</span>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {tech.category}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
