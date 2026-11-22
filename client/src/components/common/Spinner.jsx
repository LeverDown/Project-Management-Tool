import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  let dimension = 'w-6 h-6 border-2';
  if (size === 'sm') dimension = 'w-4 h-4 border-2';
  if (size === 'lg') dimension = 'w-10 h-10 border-3';

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-indigo-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${dimension} ${className}`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}
