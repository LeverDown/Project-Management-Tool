import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const PRIORITY_CHART_COLORS = {
  'Low': '#9ca3af',
  'Medium': '#f59e0b',
  'High': '#f43f5e'
};

export default function PriorityChart({ byPriority = {} }) {
  const data = Object.keys(byPriority).map((priority) => ({
    name: priority,
    count: byPriority[priority] || 0
  }));

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
        No priority data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            axisLine={{ stroke: '#334155' }}
          />
          <Tooltip
            formatter={(value) => [`${value} tasks`, 'Count']}
            cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)'
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={`cell-bar-${entry.name}`}
                fill={PRIORITY_CHART_COLORS[entry.name] || '#6b7280'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
