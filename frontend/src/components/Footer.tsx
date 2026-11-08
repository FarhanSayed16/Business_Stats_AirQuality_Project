import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          AirWatch CO — MCA I Statistics Internal Assessment | Group 3 (Air Quality and Pollution)
        </p>
        <p>
          Dataset: UCI Machine Learning Repository (Air Quality Data Set, CNR-ISAC Italy) • Powered by FastAPI & React
        </p>
      </div>
    </footer>
  );
};
