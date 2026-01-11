
import React, { useState } from 'react';
import { X, Plus, Clock, Tag, Flag, Calendar, Repeat } from 'lucide-react';
import { Category, Priority, Task } from '../types';

interface TaskFormProps {
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onClose: () => void;
  defaultDate?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onClose, defaultDate }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>(Category.PERSONAL);
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [time, setTime] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [everyday, setEveryday] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ 
      title, 
      category, 
      priority, 
      date, 
      time: time || undefined,
      everyday: everyday || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-8 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-black dark:text-white">Schedule Task</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-black dark:text-slate-400">Task Description</label>
            <input
              autoFocus
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are we planning?"
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black dark:text-slate-400 flex items-center gap-2">
                <Calendar size={12} /> Date
              </label>
              <input
                type="date"
                required={!everyday}
                disabled={everyday}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black dark:text-slate-400 flex items-center gap-2">
                <Clock size={12} /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={everyday}
                onChange={(e) => setEveryday(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex items-center gap-2 flex-1">
                <Repeat size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-black dark:text-white">Repeat Daily</span>
              </div>
            </label>
            {everyday && (
              <p className="text-xs text-slate-600 dark:text-slate-400 ml-7">This task will appear on all dates</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black dark:text-slate-400 flex items-center gap-2">
                <Tag size={12} /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-black dark:text-slate-400 flex items-center gap-2">
                <Flag size={12} /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(Priority).map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 dark:bg-blue-600 hover:from-purple-600 hover:to-pink-600 dark:hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-[1.75rem] shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Add to Schedule
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
