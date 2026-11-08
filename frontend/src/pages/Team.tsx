import React from 'react';
import { Users, Server, CheckCircle2, GitBranch, Cpu, Database, FileText, Sparkles, ExternalLink } from 'lucide-react';

type TeamMember = {
  name: string;
  role: string;
  badge: string;
  responsibilities: string[];
};

export const Team: React.FC = () => {
  const members: TeamMember[] = [
    {
      name: 'Farhan Sayed',
      role: 'System Architect & Data Engineering Lead',
      badge: 'Group 3 Lead',
      responsibilities: [
        'Raw UCI ingestion, European CSV parsing, and −200 sentinel sanitization',
        'Time-aware imputation and chronological 70/15/15 train–val–test masking',
        'FastAPI architecture, artifact loading, and React dashboard integration',
        'Repository packaging, README runbook, and deploy configs (Render / Vercel)'
      ]
    },
    {
      name: 'Salman Khan',
      role: 'Predictive Modelling Lead',
      badge: 'Modelling',
      responsibilities: [
        'Next-hour target design (`CO_next`) with strict anti-leakage feature rules',
        'Persistence baseline plus Linear / Ridge benchmark models',
        'HistGradientBoosting training path and comparison against tree ensembles',
        'Predict Lab scenario wiring aligned with `model.joblib` artifacts'
      ]
    },
    {
      name: 'Sahil Tambe',
      role: 'Statistical Analysis & EDA Lead',
      badge: 'Analytics',
      responsibilities: [
        'Univariate summaries for CO, sensors, and weather variables',
        'Diurnal (hour-of-day) and weekday pollution pattern analysis',
        'Weather–CO coupling exploration (T, RH, AH)',
        'EDA narrative for notebooks and Insights page interpretation'
      ]
    },
    {
      name: 'Shruti Pawar',
      role: 'Insights & Visualization Lead',
      badge: 'Visuals',
      responsibilities: [
        'Publication figures for diurnal, correlation, and residual plots',
        'Recharts dashboard visuals on Insights and Evaluation screens',
        'Glassmorphism UI polish consistency across chart cards',
        'Visual QA so dashboard numbers match `metrics.json` / cleaned data'
      ]
    },
    {
      name: 'Aayesha Kaliwala',
      role: 'Validation & Evaluation Lead',
      badge: 'Validation',
      responsibilities: [
        'TimeSeriesSplit hyperparameter tuning protocol and holdout scoring',
        'RMSE / MAE / R² table assembly from `artifacts/metrics.json`',
        'Error-by-magnitude and failure-mode review for viva honesty',
        'Evaluation page content: benchmarks, importance, limitations callouts'
      ]
    },
    {
      name: 'Kashish Maurya',
      role: 'Documentation, Report & Viva Lead',
      badge: 'Docs',
      responsibilities: [
        'Formal statistics report structure (approach, findings, results)',
        'Usefulness & limitations write-up for air-quality monitoring',
        'Viva script, Top-10 Q&A, and contribution statements',
        'Team dossier clarity so classmates can run and explain the system'
      ]
    }
  ];

  const techStack = [
    { name: 'Python 3.12', category: 'Core Academic Stack', desc: 'Preprocessing, statistical modelling, and evaluation' },
    { name: 'FastAPI & Uvicorn', category: 'Backend Presentation Layer', desc: 'High-performance asynchronous REST API service' },
    { name: 'Scikit-Learn', category: 'Machine Learning', desc: 'HistGradientBoosting, Ridge, TimeSeriesSplit CV' },
    { name: 'React 19 & TypeScript', category: 'Frontend Interface', desc: 'Type-safe interactive dashboard application' },
    { name: 'Tailwind CSS', category: 'Styling Toolchain', desc: 'Responsive utility styling with luminous Clean-Air design tokens' },
    { name: 'Recharts', category: 'Data Visualization', desc: 'Interactive timeseries, bar charts, and scatter plots' }
  ];

  const apiBase =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && (window.location.port === '8000' || !window.location.port)
      ? ''
      : 'http://localhost:8000');

  const deliverables = [
    { name: 'Formal Statistics Assessment Report (HTML)', format: 'HTML (printable)', path: `${apiBase}/reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.html`, desc: 'Full college assessment report — open and Print to PDF if needed.' },
    { name: 'Formal Statistics Assessment Report (PDF)', format: 'PDF', path: `${apiBase}/reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.pdf`, desc: 'Submission-ready PDF generated from metrics + report summary.' },
    { name: 'Viva Presentation Script & Top 10 Q&A', format: 'Markdown', path: `${apiBase}/reports/VIVA_PRESENTATION_SCRIPT_AND_QA.md`, desc: '8–10 minute oral walkthrough and examiner defense notes.' },
    { name: 'Curated Cleaned Atmospheric Dataset', format: 'CSV (9,353 rows)', path: `${apiBase}/data/download`, desc: 'Fully preprocessed dataset ready for reproduction.' }
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold tracking-wide border border-sky-200/80 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Research Dossier & Technical Credits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Project Team & System Architecture
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          MCA I Statistics Internal Assessment — <strong className="text-slate-700">Group 3: Air Quality and Pollution</strong>. Developed for university coursework, combining academic statistics with a modern telemetry interface.
        </p>
        <p className="text-xs text-slate-600 mt-3 max-w-3xl glass-inner rounded-xl px-3 py-2">
          Official <strong>Group 3</strong> roster (6 members) with roles aligned to the AirWatch CO academic core and dashboard.
        </p>
        <div className="mt-3 text-xs text-slate-600 glass-inner rounded-xl px-3 py-2 max-w-2xl">
          <strong className="text-slate-800">Demo URLs:</strong> Local dashboard <code className="font-mono text-sky-700">http://localhost:5173</code>
          {' '}· API <code className="font-mono text-sky-700">http://localhost:8000</code>
          {' '}· Cloud deploy configs ready in <code className="font-mono">render.yaml</code> / <code className="font-mono">frontend/vercel.json</code> (awaiting host credentials).
        </div>
      </div>

      {/* Team Member Cards — official Group 3 (6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {members.map((m) => (
          <div
            key={m.name}
            className="glass-panel rounded-3xl p-6 flex flex-col space-y-5 hover:bg-white/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="w-10 h-10 rounded-2xl glass-inner text-sky-600 flex items-center justify-center font-bold shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full glass-soft text-sky-700 font-mono">
                {m.badge}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{m.name}</h3>
              <p className="text-xs font-semibold text-sky-700 mt-0.5">{m.role}</p>
            </div>
            <div className="pt-3 border-t border-white/40">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                Key Responsibilities:
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                {m.responsibilities.map((r, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Dual-Layer Architecture Blueprint */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="border-b border-white/40 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sky-600" />
            <span>Dual-Layer Architectural Architecture</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict boundary separation between the Python academic statistics core and the modern dashboard presentation service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-2xl glass-inner space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
              <Database className="w-4 h-4 text-sky-600" />
              <span>1. Academic Core</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              4 serialized Jupyter notebooks covering preprocessing, EDA, baseline regression, and 5-fold TimeSeriesSplit tuning.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-inner space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span>2. Artifact Engine</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Serialized champion model (<code className="font-mono text-sky-700 bg-sky-50 px-1 py-0.5 rounded">model.joblib</code>), statistical metrics (<code className="font-mono text-sky-700 bg-sky-50 px-1 py-0.5 rounded">metrics.json</code>), and feature schema.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-inner space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
              <Server className="w-4 h-4 text-sky-600" />
              <span>3. FastAPI Presentation</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Asynchronous backend exposing overview KPIs, timeseries summaries, historical predictions, and custom what-if simulation.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-inner space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>4. React 19 Interface</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vite + TypeScript + Tailwind CSS SPA providing interactive telemetry, live simulator HUD, and assessment reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="border-b border-white/40 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-600" />
            <span>Technology Stack & Scientific Libraries</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Underlying computational and presentation frameworks powering AirWatch CO.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {techStack.map((tech) => (
            <div key={tech.name} className="p-3.5 rounded-2xl glass-inner space-y-1 hover:border-sky-200 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-700 text-xs">{tech.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">{tech.category}</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Deliverables Hub */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="border-b border-white/40 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Assessment Deliverables & Submission Assets</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Official course assessment documentation generated by this repository.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {deliverables.map((del, i) => (
            <div key={i} className="p-4 rounded-2xl glass-inner flex items-start justify-between gap-3 hover:border-sky-200 transition-colors">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900">{del.name}</div>
                <div className="text-[11px] text-slate-500">{del.desc}</div>
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                  {del.format}
                </span>
              </div>
              {del.path !== '#' && (
                <a
                  href={del.path}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl glass-soft text-slate-500 hover:text-sky-700 hover:bg-white/55 transition-colors"
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
