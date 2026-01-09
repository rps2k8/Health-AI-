
import React from 'react';

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, value, onChange }) => {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between p-4 mb-3 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group"
    >
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-200">{label}</span>
      <div
        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 ${
          value ? 'bg-teal-500 shadow-[0_0_15px_rgba(45,212,191,0.3)]' : 'bg-slate-800'
        }`}
      >
        <span
          className={`${
            value ? 'translate-x-6 bg-white' : 'translate-x-1 bg-slate-500'
          } inline-block h-3 w-3 transform rounded-full transition-all`}
        />
      </div>
    </button>
  );
};
