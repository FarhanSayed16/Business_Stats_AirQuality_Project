import React from 'react';
import { Users, Server, CheckCircle2, GitBranch, Cpu, Database, FileText, Sparkles, ExternalLink } from 'lucide-react';

export const Team: React.FC = () => {
  const members = [
    {
      name: 'Farhan Sayed',
      role: 'System Architect & Data Engineering Lead',
      badge: 'Group 3 Lead',
      responsibilities: [
        'Raw dataset ingestion, delimiter parsing, and -200 hardware sentinel sanitization',
        'Time-aware linear interpolation and chronological train/val/test split masking',
        'FastAPI REST backend architecture, high-concurrency routers, and model persistence',
        'React + Vite + TypeScript dashboard engineering, data visualization, and full-stack integration'
      ]
    },
    {
      name: 'Group 3 Analytics Specialist',
      role: 'Statistical Analysis & EDA Lead',
      badge: 'Analytics Lead',
      responsibilities: [
        'Parametric summary statistics, central tendencies, and diurnal dispersion metrics',
        'Diurnal rush-hour bimodal curve characterization and Sunday activity minimum modeling',
        'Atmospheric microclimatic coupling (Temperature, Relative Humidity, Absolute Humidity)',
        'Publication-standard statistical chart generation and exploratory report drafting'
      ]
    },
    {
      name: 'Group 3 Modelling Specialist',
      role: 'Machine Learning & Validation Lead',
      badge: 'Modelling Lead',
      responsibilities: [
        'Supervised learning target formulation (CO_next) with strict anti-leakage policies',
        'Naive persistence baseline implementation and standardized Linear/Ridge benchmarks',
        '5-fold TimeSeriesSplit cross-validation for HistGradientBoosting hyperparameter tuning',
        'Holdout test set evaluation (RMSE, MAE, R²) and artifact serialization (model.joblib, metrics.json)'
      ]
    }
  ];

  const techStack = [
    { name: 'Python 3.12', category: 'Core Academic Stack', desc: 'Preprocessing, statistical modelling, and evaluation' },
    { name: 'FastAPI & Uvicorn', category: 'Backend Presentation Layer', desc: 'High-performance asynchronous REST API service' },
    { name: 'Scikit-Learn', category: 'Machine Learning', desc: 'HistGradientBoosting, Ridge, TimeSeriesSplit CV' },
    { name: 'React 19 & TypeScript', category: 'Frontend Interface', desc: 'Type-safe interactive dashboard application' },
    { name: 'Tailwind CSS', category: 'Styling Toolchain', desc: 'Responsive utility styling with dark obsidian design tokens' },
    { name: 'Recharts', category: 'Data Visualization', desc: 'Interactive timeseries, bar charts, and scatter plots' }
  ];

  const deliverables = [
    { name: 'Formal Statistics Assessment Report', format: 'HTML (Printable / PDF)', path: '/reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.html', desc: '12-section comprehensive college assessment report.' },
    { name: 'Viva Presentation Script & Top 10 Q&A', format: 'Markdown Dossier', path: '/reports/VIVA_PRESENTATION_SCRIPT_AND_QA.md', desc: '8–10 minute oral walkthrough and examiner defense notes.' },
    { name: 'Curated Cleaned Atmospheric Dataset', format: 'CSV (2.5 MB, 9,353 Rows)', path: '/data/download', desc: 'Fully preprocessed dataset ready for reproduction.' },
    { name: 'Champion Model & Serialization Weights', format: 'Joblib & JSON Artifacts', path: '#', desc: 'Tuned HistGradientBoostingRegressor and feature schema.' }
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/20 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Research Dossier & Technical Credits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Project Team & System Architecture
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          MCA I Statistics Internal Assessment — <strong>Group 3: Air Quality and Pollution</strong>. Developed for university coursework, combining academic statistics with a modern telemetry interface.
        </p>
      </div>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {members.map((m, i) => (
          <div key={i} className="bg-[#0b1220]/75 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col justify-between space-y-5 hover:border-teal-500/40 transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono">
                  {m.badge}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{m.name}</h3>
                <p className="text-xs font-semibold text-teal-400 mt-0.5">{m.role}</p>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Key Responsibilities:</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {m.responsibilities.map((r, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dual-Layer Architecture Blueprint */}
      <div className="bg-[#0b1220]/75 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-teal-400" />
            <span>Dual-Layer Architectural Architecture</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict boundary separation between the Python academic statistics core and the modern dashboard presentation service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2 text-xs">
              <Database className="w-4 h-4 text-teal-400" />
              <span>1. Academic Core</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              4 serialized Jupyter notebooks covering preprocessing, EDA, baseline regression, and 5-fold TimeSeriesSplit tuning.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2 text-xs">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>2. Artifact Engine</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serialized champion model (<code className="font-mono text-teal-300">model.joblib</code>), statistical metrics (<code className="font-mono text-teal-300">metrics.json</code>), and feature schema.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2 text-xs">
              <Server className="w-4 h-4 text-sky-400" />
              <span>3. FastAPI Presentation</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Asynchronous backend exposing overview KPIs, timeseries summaries, historical predictions, and custom what-if simulation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>4. React 19 Interface</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vite + TypeScript + Tailwind CSS SPA providing interactive telemetry, live simulator HUD, and assessment reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="bg-[#0b1220]/75 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>Technology Stack & Scientific Libraries</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Underlying computational and presentation frameworks powering AirWatch CO.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {techStack.map((tech) => (
            <div key={tech.name} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-teal-300 text-xs">{tech.name}</span>
                <span className="text-[10px] text-slate-400">{tech.category}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Deliverables Hub */}
      <div className="bg-[#0b1220]/75 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Assessment Deliverables & Submission Assets</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Official course assessment documentation generated by this repository.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deliverables.map((del, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 hover:border-teal-500/30 transition-colors">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">{del.name}</div>
                <div className="text-[11px] text-slate-400">{del.desc}</div>
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  {del.format}
                </span>
              </div>
              {del.path !== '#' && (
                <a
                  href={del.path}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-300 hover:border-teal-500/40 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
