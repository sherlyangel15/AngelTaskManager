
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
  [Category.WORK]: { color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', icon: <Briefcase size={16} /> },
  [Category.STUDY]: { color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20', icon: <BookOpen size={16} /> },
  [Category.PERSONAL]: { color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', icon: <User size={16} /> },
  [Category.HEALTH]: { color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20', icon: <Heart size={16} /> },
  [Category.FINANCE]: { color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20', icon: <DollarSign size={16} /> },
  [Category.OTHER]: { color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/20', icon: <MoreHorizontal size={16} /> },
};

export const PRIORITY_CONFIG: Record<Priority, { color: string, icon: React.ReactNode }> = {
  [Priority.LOW]: { color: 'text-slate-400', icon: <Circle size={14} /> },
  [Priority.MEDIUM]: { color: 'text-amber-500', icon: <Clock size={14} /> },
  [Priority.HIGH]: { color: 'text-rose-500', icon: <AlertCircle size={14} /> },
};
