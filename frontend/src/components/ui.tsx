import React from 'react';
import { AlertTriangle, Loader2, RefreshCw, Inbox } from 'lucide-react';

export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`glass-panel rounded-3xl ${className}`}>
    {children}
  </div>
);

export const LoadingState: React.FC<{ label?: string }> = ({
  label = 'Loading atmospheric intelligence…'
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 animate-fade-in">
    <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({
  message = 'Unable to reach the AirWatch CO API. Start the backend on port 8000 and retry.',
  onRetry
}) => (
  <div className="rounded-3xl glass-panel border-rose-200/60 p-6 sm:p-8 animate-fade-in">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-2xl glass-inner text-rose-600 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="space-y-3 flex-1">
        <div>
          <h3 className="font-bold text-rose-900 text-sm">Connection issue</h3>
          <p className="text-xs text-rose-800/90 mt-1 leading-relaxed">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  </div>
);

export const EmptyState: React.FC<{ title?: string; detail?: string }> = ({
  title = 'No records match these filters',
  detail = 'Try widening the date range or clearing hour/split filters.'
}) => (
  <div className="flex flex-col items-center justify-center gap-2 py-14 text-slate-500 animate-fade-in">
    <Inbox className="w-8 h-8 text-slate-400" />
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    <p className="text-xs text-slate-500">{detail}</p>
  </div>
);

/** Project-defined CO bins (analytical), not certified AQI / WHO labels */
export function coTier(co: number): {
  label: string;
  tone: string;
  bar: string;
} {
  if (co < 2) {
    return {
      label: 'Low pollution tier',
      tone: 'glass-soft text-sky-800',
      bar: '#0284c7'
    };
  }
  if (co < 4) {
    return {
      label: 'Moderate pollution tier',
      tone: 'glass-soft text-amber-800',
      bar: '#f59e0b'
    };
  }
  return {
    label: 'High pollution tier',
    tone: 'glass-soft text-rose-800',
    bar: '#f43f5e'
  };
}

export const COGauge: React.FC<{ value: number; max?: number }> = ({
  value,
  max = 8
}) => {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = clamped / max;
  const circumference = Math.PI * 80;
  const offset = circumference * (1 - pct);
  const tier = coTier(value);

  return (
    <div className="flex flex-col items-center justify-center pt-2 animate-fade-in">
      <div className="relative w-64 h-32 flex items-end justify-center">
        <svg className="w-64 h-32 overflow-visible" viewBox="0 0 200 100">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={tier.bar}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute bottom-0 flex flex-col items-center text-center">
          <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
            {value.toFixed(2)}
          </span>
          <span className="text-xs font-medium text-slate-500">mg/m³ mean CO(GT)</span>
        </div>
      </div>
      <div
        className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${tier.tone}`}
      >
        {tier.label}
      </div>
      <p className="text-[10px] text-slate-400 mt-2 max-w-xs text-center">
        Analytical project bins (&lt;2 / 2–4 / &gt;4 mg/m³), not a certified regulatory AQI scale.
      </p>
    </div>
  );
};

export const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-soft text-sky-800 text-xs font-semibold tracking-wide mb-2">
    {children}
  </div>
);
