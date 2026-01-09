
import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, onChange, unit }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-6 sm:mb-8 group">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2 sm:mb-3">
        <label className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-slate-300 transition-colors">
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-black text-white leading-none tracking-tighter">{value}</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-teal-500 uppercase tracking-widest">{unit}</span>
        </div>
      </div>
      <div className="relative h-7 sm:h-6 flex items-center touch-pan-x">
        <div className="absolute w-full h-1 bg-slate-900 rounded-full overflow-hidden">
           <div 
             className="h-full bg-gradient-to-r from-teal-500 via-cyan-500 to-purple-500 opacity-30" 
             style={{ width: `${percentage}%` }} 
           />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute w-full h-full bg-transparent appearance-none cursor-pointer z-10 custom-range-input"
        />
        <style>{`
          .custom-range-input::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            background: #2dd4bf;
            border-radius: 4px;
            box-shadow: 0 0 15px rgba(45, 212, 191, 0.8);
            border: 2px solid #fff;
            cursor: pointer;
            transition: transform 0.2s ease;
          }
          .custom-range-input::-webkit-slider-thumb:active {
            transform: scale(1.3);
          }
          .custom-range-input::-moz-range-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            background: #2dd4bf;
            border-radius: 4px;
            box-shadow: 0 0 15px rgba(45, 212, 191, 0.8);
            border: 2px solid #fff;
            cursor: pointer;
            transition: transform 0.2s ease;
          }
          .custom-range-input::-moz-range-thumb:active {
            transform: scale(1.3);
          }
        `}</style>
      </div>
    </div>
  );
};
