import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants.js';

export function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_COLORS[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400'
  };

  const pad = size === 'xs' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${pad}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'sm' }) {
  const config = PRIORITY_COLORS[priority] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200'
  };

  const pad = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${config.bg} ${config.text} ${config.border} ${pad}`}
    >
      {priority}
    </span>
  );
}

export default StatusBadge;
