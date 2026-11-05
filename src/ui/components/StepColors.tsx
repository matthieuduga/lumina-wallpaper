import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { ColorRamp, PaletteSpec } from '../../modules/types';
import { generateRandomPalette, HarmonyMode } from '../../engine/randomizer';
import { Sparkles, Lock, Unlock, Undo, Redo, Copy, Check, Download, Upload } from 'lucide-react';

interface StepColorsProps {
  palettes?: PaletteSpec[];
  activePalette: PaletteSpec;
  onSelectPalette: (palette: PaletteSpec) => void;
  onUpdateCustomColors: (palette: PaletteSpec) => void;
}

export const StepColors: React.FC<StepColorsProps> = ({
  palettes = [],
  activePalette,
  onSelectPalette,
  onUpdateCustomColors,
}) => {
  const { t } = useI18n();

  const [colorTab, setColorTab] = useState<'presets' | 'random' | 'custom'>('presets');

  // Randomizer state
  const [lockedLeft, setLockedLeft] = useState(false);
  const [lockedRight, setLockedRight] = useState(false);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('analogous');
  const [history, setHistory] = useState<PaletteSpec[]>([activePalette]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  const handleRollRandom = () => {
    const newPal = generateRandomPalette({
      mode: harmonyMode,
      lockedLeft: lockedLeft ? activePalette.leftRamp : null,
      lockedRight: lockedRight ? activePalette.rightRamp : null,
    });

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPal);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    onSelectPalette(newPal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onSelectPalette(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onSelectPalette(history[historyIndex + 1]);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activePalette, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `palette-${activePalette.id}.json`);
    dlAnchor.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.leftRamp && parsed.rightRamp && parsed.bgDark) {
          onSelectPalette(parsed);
        }
      } catch {
        alert('Invalid JSON palette file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
          {t('step3.title')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-neutral-400">{t('step3.subtitle')}</p>
      </div>

      {/* Mode Sub-tabs */}
      <div className="flex rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 p-1 backdrop-blur-md">
        <button
          onClick={() => setColorTab('presets')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition cursor-pointer ${
            colorTab === 'presets'
              ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('step3.tabs.presets')}
        </button>
        <button
          onClick={() => setColorTab('random')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition cursor-pointer ${
            colorTab === 'random'
              ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('step3.tabs.random')}
        </button>
        <button
          onClick={() => setColorTab('custom')}
          className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition cursor-pointer ${
            colorTab === 'custom'
              ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('step3.tabs.custom')}
        </button>
      </div>

      {/* Tab 1: 16 Presets Cards */}
      {colorTab === 'presets' && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 max-h-[340px] overflow-y-auto pr-1">
          {palettes.map((p) => {
            const isSelected = activePalette.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => onSelectPalette(p)}
                className={`group cursor-pointer rounded-xl border p-2.5 transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-500/15 shadow-md shadow-sky-500/10'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100/80 dark:hover:bg-white/10'
                }`}
              >
                {/* Visual Swatch */}
                <div
                  className="relative h-12 w-full rounded-lg overflow-hidden border border-slate-300 dark:border-white/15 p-1 flex items-center justify-between shadow-inner"
                  style={{ backgroundColor: p.bgDark }}
                >
                  {/* Left mini ramp */}
                  <div className="flex h-full w-[45%] rounded overflow-hidden">
                    {p.leftRamp.map((c, i) => (
                      <div key={i} className="h-full flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  {/* Right mini ramp */}
                  <div className="flex h-full w-[45%] rounded overflow-hidden">
                    {p.rightRamp.map((c, i) => (
                      <div key={i} className="h-full flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-neutral-200 group-hover:text-slate-950 dark:group-hover:text-white block truncate">
                    {p.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Harmonious Randomizer */}
      {colorTab === 'random' && (
        <div className="space-y-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4 backdrop-blur-md">
          {/* Surprise Me Button */}
          <button
            onClick={handleRollRandom}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
          >
            <Sparkles size={16} />
            <span>{t('step3.random.surprise')}</span>
          </button>

          {/* Controls: Lock ramps, Harmony mode */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Lock Left Ramp */}
            <button
              onClick={() => setLockedLeft(!lockedLeft)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition cursor-pointer ${
                lockedLeft
                  ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lockedLeft ? <Lock size={13} /> : <Unlock size={13} />}
              <span>{t('step3.random.lockLeft')}</span>
            </button>

            {/* Lock Right Ramp */}
            <button
              onClick={() => setLockedRight(!lockedRight)}
              className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition cursor-pointer ${
                lockedRight
                  ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300'
                  : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lockedRight ? <Lock size={13} /> : <Unlock size={13} />}
              <span>{t('step3.random.lockRight')}</span>
            </button>
          </div>

          {/* Harmony rule and history */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 dark:text-neutral-400">{t('step3.random.mode')}</span>
              <select
                value={harmonyMode}
                onChange={(e) => setHarmonyMode(e.target.value as HarmonyMode)}
                className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="analogous">Analogous</option>
                <option value="complementary">Complementary</option>
                <option value="split-complementary">Split-Complementary</option>
                <option value="triadic">Triadic</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="rounded p-1 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                title={t('step3.random.undo')}
              >
                <Undo size={14} />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="rounded p-1 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                title={t('step3.random.redo')}
              >
                <Redo size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Custom Color Lab */}
      {colorTab === 'custom' && (
        <div className="space-y-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-4 backdrop-blur-md max-h-[360px] overflow-y-auto pr-1">
          {/* Background Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-neutral-400 mb-1">
                {t('step3.custom.darkBg')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activePalette.bgDark}
                  onChange={(e) =>
                    onUpdateCustomColors({ ...activePalette, bgDark: e.target.value })
                  }
                  className="h-8 w-10 cursor-pointer rounded border border-slate-300 dark:border-white/15 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={activePalette.bgDark}
                  onChange={(e) =>
                    onUpdateCustomColors({ ...activePalette, bgDark: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-2 py-1 font-mono text-xs text-slate-900 dark:text-white uppercase focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-neutral-400 mb-1">
                {t('step3.custom.lightBg')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={activePalette.bgLight || '#f0f0f4'}
                  onChange={(e) =>
                    onUpdateCustomColors({ ...activePalette, bgLight: e.target.value })
                  }
                  className="h-8 w-10 cursor-pointer rounded border border-slate-300 dark:border-white/15 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={activePalette.bgLight || ''}
                  placeholder="#F0F0F4"
                  onChange={(e) =>
                    onUpdateCustomColors({ ...activePalette, bgLight: e.target.value })
                  }
                  className="w-full rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 px-2 py-1 font-mono text-xs text-slate-900 dark:text-white uppercase focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Left Ramp Stops */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-neutral-300 mb-2">
              {t('step3.custom.leftRamp')}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {activePalette.leftRamp.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const next = [...activePalette.leftRamp] as ColorRamp;
                      next[i] = e.target.value;
                      onUpdateCustomColors({ ...activePalette, leftRamp: next });
                    }}
                    className="h-7 w-full cursor-pointer rounded border border-slate-300 dark:border-white/15 bg-transparent p-0"
                  />
                  <span className="font-mono text-[9px] text-slate-600 dark:text-neutral-400 uppercase truncate w-full text-center">
                    {color}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Ramp Stops */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-neutral-300 mb-2">
              {t('step3.custom.rightRamp')}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {activePalette.rightRamp.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const next = [...activePalette.rightRamp] as ColorRamp;
                      next[i] = e.target.value;
                      onUpdateCustomColors({ ...activePalette, rightRamp: next });
                    }}
                    className="h-7 w-full cursor-pointer rounded border border-slate-300 dark:border-white/15 bg-transparent p-0"
                  />
                  <span className="font-mono text-[9px] text-slate-600 dark:text-neutral-400 uppercase truncate w-full text-center">
                    {color}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Export / Import & Share Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
            <div className="flex gap-2">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 py-1 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              >
                <Download size={11} />
                <span>{t('step3.custom.exportJson')}</span>
              </button>
              <label className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-2 py-1 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer">
                <Upload size={11} />
                <span>{t('step3.custom.importJson')}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1 rounded-md border border-sky-400/30 bg-sky-500/10 dark:bg-sky-500/20 px-2.5 py-1 text-sky-600 dark:text-sky-300 hover:bg-sky-500/20 dark:hover:bg-sky-500/30 transition cursor-pointer"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? t('step3.custom.copied') : t('step3.custom.copyShare')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
