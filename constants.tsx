
import React from 'react';
import { 
  Briefcase, 
  BookOpen, 
  User, 
  Heart, 
  DollarSign, 
  MoreHorizontal,
  Circle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Category, Priority } from './types';

export const CATEGORY_CONFIG: Record<Category, { color: string, icon: React.ReactNode }> = {
  [Category.WORK]: { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-500', icon: <Briefcase size={16} /> },
  [Category.STUDY]: { color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-500', icon: <BookOpen size={16} /> },
  [Category.PERSONAL]: { color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-500', icon: <User size={16} /> },
  [Category.HEALTH]: { color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/20 dark:text-rose-500', icon: <Heart size={16} /> },
  [Category.FINANCE]: { color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-500', icon: <DollarSign size={16} /> },
  [Category.OTHER]: { color: 'text-slate-700 bg-slate-100 dark:bg-slate-800/20 dark:text-slate-500', icon: <MoreHorizontal size={16} /> },
};

export const PRIORITY_CONFIG: Record<Priority, { color: string, icon: React.ReactNode }> = {
  [Priority.LOW]: { color: 'text-slate-600 dark:text-slate-400', icon: <Circle size={14} /> },
  [Priority.MEDIUM]: { color: 'text-amber-600 dark:text-amber-500', icon: <Clock size={14} /> },
  [Priority.HIGH]: { color: 'text-rose-600 dark:text-rose-500', icon: <AlertCircle size={14} /> },
};
