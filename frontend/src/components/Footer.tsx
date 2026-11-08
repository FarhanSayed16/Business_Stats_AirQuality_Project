import React from 'react';
import { FileText, ExternalLink, ShieldCheck, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/50 bg-white/30 backdrop-blur-2xl py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
          <div>
            <p className="font-bold text-slate-800">
              AirWatch CO <span className="font-normal text-slate-500">— MCA I Statistics Internal Assessment (Group 3)</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              UCI Air Quality Repository • S. De Vito et al. (CNR-ISAC Italy)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-600">
          <a
            href="https://github.com/FarhanSayed16/Business_Stats_AirQuality_Project"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-sky-700 transition-colors font-medium"
          >
            <Code2 className="w-3.5 h-3.5 text-sky-600" />
            <span>GitHub Repository</span>
          </a>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Anti-Leakage Certified (TimeSeriesSplit)</span>
          </span>
          <span className="text-slate-300">•</span>
          <a
            href="/reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-sky-700 transition-colors font-medium"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Assessment Report (HTML)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </footer>
  );
};
