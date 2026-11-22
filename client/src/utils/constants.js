export const STATUSES = ['Todo', 'In Progress', 'Review', 'Done'];

export const PRIORITIES = ['Low', 'Medium', 'High'];

export const STATUS_COLORS = {
  'Todo': {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400'
  },
  'In Progress': {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500'
  },
  'Review': {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500'
  },
  'Done': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500'
  }
};

export const PRIORITY_COLORS = {
  'Low': {
    bg: 'bg-gray-100 dark:bg-slate-800',
    text: 'text-gray-600 dark:text-slate-400',
    border: 'border-gray-200 dark:border-slate-700'
  },
  'Medium': {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800'
  },
  'High': {
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800'
  }
};
