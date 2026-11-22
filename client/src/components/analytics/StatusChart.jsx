import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const STATUS_CHART_COLORS = {
  'Todo': '#94a3b8',
  'In Progress': '#3b82f6',
  'Review': '#f59e0b',
  'Done': '#10b981'
};

export default function StatusChart({ byStatus = {} }) {
  const data = Object.keys(byStatus).map((status) => ({
    name: status,
    value: byStatus[status] || 0
  }));

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
        No status data available
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={STATUS_CHART_COLORS[entry.name] || '#6b7280'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} tasks`, name]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.2)'
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-gray-700 dark:text-slate-300 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
