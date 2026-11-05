import React from 'react';
import { useI18n } from '../../i18n';
import { WallpaperModule } from '../../modules/types';
import { getAllModules } from '../../modules';
import { CheckCircle2, Lock } from 'lucide-react';

interface StepTypeProps {
  activeModule: WallpaperModule<any>;
  onSelectModule: (module: WallpaperModule<any>) => void;
  moduleParams: any;
  onChangeParams: (newParams: any) => void;
}

export const StepType: React.FC<StepTypeProps> = ({
  activeModule,
  onSelectModule,
  moduleParams,
  onChangeParams,
}) => {
  const { t } = useI18n();
  const modules = getAllModules();

  const upcomingModules = [
    {
      id: 'mesh-gradients',
      name: 'Mesh Gradients',
      description: 'Organic, multi-point color bleeds with smooth dynamic noise.',
    },
    {
      id: 'aurora-waves',
      name: 'Aurora Waves',
      description: 'Luminous undulating northern-light ribbon caustics.',
    },
    {
      id: 'prismatic-rings',
      name: 'Prismatic Rings',
      description: 'Concentric chromatic refraction toroids and frosted glass discs.',
    },
  ];

  const CustomControls = activeModule.CustomControls;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {t('step1.title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">{t('step1.subtitle')}</p>
      </div>

      {/* Available Modules Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {modules.map((m) => {
          const isSelected = activeModule.id === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModule(m)}
              className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-500/10 shadow-lg shadow-sky-500/10'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/80 dark:hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{m.name}</span>
                    <span className="rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      {t('step1.active')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                    {m.description}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 size={18} className="text-sky-500 dark:text-sky-400 shrink-0" />
                )}
              </div>
            </div>
          );
        })}

        {/* Coming Soon Teaser Modules */}
        {upcomingModules.map((um) => (
          <div
            key={um.id}
            className="relative rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02] p-4 opacity-70"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-neutral-400">{um.name}</span>
                  <span className="flex items-center gap-1 rounded-full bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-neutral-400">
                    <Lock size={10} />
                    {t('step1.comingSoon')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400 dark:text-neutral-500">{um.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Module-Specific Tuning Controls */}
      {CustomControls && (
        <div className="mt-6">
          <CustomControls params={moduleParams} onChange={onChangeParams} />
        </div>
      )}
    </div>
  );
};
