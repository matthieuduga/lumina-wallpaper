import React from 'react';

export interface GlassPillsParams {
  pillCount: number;
  pillScale: number;
  pillStagger: number;
}

export interface GlassPillsControlsProps {
  params: GlassPillsParams;
  onChange: (newParams: GlassPillsParams) => void;
}

export const GlassPillsControls: React.FC<GlassPillsControlsProps> = ({
  params,
  onChange,
}) => {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4 backdrop-blur-md">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
        Glass Pills Parameters
      </h4>

      {/* Pill Count */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-700 dark:text-neutral-300">Capsule Count</span>
          <span className="font-mono text-slate-500 dark:text-neutral-400">{params.pillCount}</span>
        </div>
        <input
          type="range"
          min="3"
          max="12"
          step="1"
          value={params.pillCount}
          onChange={(e) =>
            onChange({ ...params, pillCount: parseInt(e.target.value, 10) })
          }
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-neutral-700 accent-sky-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500">
          <span>3</span>
          <span>6 (Default)</span>
          <span>12</span>
        </div>
      </div>

      {/* Pill Scale */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-700 dark:text-neutral-300">Capsule Scale</span>
          <span className="font-mono text-slate-500 dark:text-neutral-400">
            {params.pillScale.toFixed(2)}×
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.05"
          value={params.pillScale}
          onChange={(e) =>
            onChange({ ...params, pillScale: parseFloat(e.target.value) })
          }
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-neutral-700 accent-sky-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500">
          <span>0.5×</span>
          <span>1.0×</span>
          <span>2.0×</span>
        </div>
      </div>

      {/* Pill Stagger */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-700 dark:text-neutral-300">Stagger / Offset</span>
          <span className="font-mono text-slate-500 dark:text-neutral-400">
            {params.pillStagger.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="-1.0"
          max="1.0"
          step="0.1"
          value={params.pillStagger}
          onChange={(e) =>
            onChange({ ...params, pillStagger: parseFloat(e.target.value) })
          }
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-neutral-700 accent-sky-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500">
          <span>-1.0</span>
          <span>0.0 (Balanced)</span>
          <span>+1.0</span>
        </div>
      </div>
    </div>
  );
};
