
import React from 'react';

interface ProgressCircleProps {
  percentage: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ percentage }) => {
  const radius = 60; // Increased radius
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center w-full max-w-[300px] aspect-square mx-auto">
      <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-100 dark:text-slate-800/50"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          strokeLinecap="round"
          className="text-blue-600 dark:text-blue-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-black text-slate-900 dark:text-white leading-none">
          {Math.round(percentage)}%
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mt-2">Daily Goal</span>
      </div>
    </div>
  );
};

export default ProgressCircle;
