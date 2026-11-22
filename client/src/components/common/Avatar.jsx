import React from 'react';

const COLORS = [
  'bg-indigo-500 text-white',
  'bg-emerald-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-purple-500 text-white',
  'bg-teal-500 text-white',
  'bg-cyan-500 text-white',
  'bg-sky-500 text-white'
];

function getColorForString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}

export default function Avatar({ user, name, size = 'md', className = '' }) {
  const displayName = user?.name || name || 'User';
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';
  const colorClass = getColorForString(displayName);

  let sizeClasses = 'w-8 h-8 text-xs';
  if (size === 'xs') sizeClasses = 'w-6 h-6 text-[10px]';
  if (size === 'sm') sizeClasses = 'w-7 h-7 text-xs';
  if (size === 'lg') sizeClasses = 'w-10 h-10 text-sm font-semibold';
  if (size === 'xl') sizeClasses = 'w-14 h-14 text-lg font-bold';

  return (
    <div
      title={displayName}
      className={`inline-flex items-center justify-center rounded-full font-medium shadow-sm flex-shrink-0 select-none ${colorClass} ${sizeClasses} ${className}`}
    >
      {initial}
    </div>
  );
}
