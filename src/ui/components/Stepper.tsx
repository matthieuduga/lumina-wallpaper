import React from 'react';
import { useI18n } from '../../i18n';
import { Layers, Monitor, Palette, SunMoon, Download } from 'lucide-react';

export type StepId = 1 | 2 | 3 | 4 | 5;

interface StepperProps {
  currentStep: StepId;
  onSelectStep: (step: StepId) => void;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, onSelectStep }) => {
  const { t } = useI18n();

  const steps = [
    { id: 1 as StepId, label: t('steps.style'), icon: Layers },
    { id: 2 as StepId, label: t('steps.device'), icon: Monitor },
    { id: 3 as StepId, label: t('steps.colors'), icon: Palette },
    { id: 4 as StepId, label: t('steps.theme'), icon: SunMoon },
    { id: 5 as StepId, label: t('steps.download'), icon: Download },
  ];

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-1 sm:gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-neutral-900/40 p-1.5 backdrop-blur-md transition-colors">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.id;
          const isPassed = currentStep > s.id;

          return (
            <li key={s.id} className="flex-1">
              <button
                onClick={() => onSelectStep(s.id)}
                className={`group flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : isPassed
                    ? 'text-slate-700 dark:text-neutral-300 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    : 'text-slate-500 dark:text-neutral-400 hover:bg-slate-200/60 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-neutral-300'
                }`}
              >
                <Icon
                  size={14}
                  className={`shrink-0 ${
                    isActive
                      ? 'text-white'
                      : isPassed
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-400 dark:text-neutral-500'
                  }`}
                />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
