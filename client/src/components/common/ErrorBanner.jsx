import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onRetry, className = '' }) {
  if (!message) return null;

  return (
    <div
      className={`flex items-start justify-between gap-3 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-medium">Error: </span>
          <span>{message}</span>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-rose-100 hover:bg-rose-200 text-rose-900 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
