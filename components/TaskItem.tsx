
import React from 'react';
import { Check, Trash2, Clock } from 'lucide-react';
import { Task } from '../types';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../constants';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  currentDate: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, currentDate }) => {
  const categoryInfo = CATEGORY_CONFIG[task.category];
  const priorityInfo = PRIORITY_CONFIG[task.priority];
  
  // For everyday tasks, check if completed for the current date
  // For regular tasks, use the completed flag
  const isCompleted = task.everyday 
    ? (task.completedDates || []).includes(currentDate)
    : task.completed;

  return (
    <div 
      className={`group relative flex items-center gap-5 p-5 rounded-[1.75rem] transition-all duration-300 glass hover:scale-[1.01] ${
        isCompleted ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'
      }`}
    >
      <button 
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
          isCompleted 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 text-white' 
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
        }`}
      >
        {isCompleted && <Check size={18} strokeWidth={3} />}
      </button>

      <div className="flex-grow min-w-0">
        <h3 className={`text-lg font-extrabold truncate transition-all ${
          isCompleted ? 'line-through text-slate-400' : 'text-black dark:text-white'
        }`}>
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${categoryInfo.color}`}>
            {React.cloneElement(categoryInfo.icon as React.ReactElement, { size: 12 })}
            {task.category}
          </span>
          <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${priorityInfo.color}`}>
            {React.cloneElement(priorityInfo.icon as React.ReactElement, { size: 12 })}
            {task.priority}
          </span>
          {task.time && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-black dark:text-slate-400 uppercase tracking-tight">
              <Clock size={12} />
              {task.time}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-black dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
