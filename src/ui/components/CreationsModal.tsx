import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n';
import { SavedCreation, deleteCreation, clearAllCreations } from '../../engine/storage';
import { ShareConfig, buildShareUrl } from '../../engine/share';
import { Search, X, Layers, Trash2, Share2, Check, ArrowUpRight, Clock, Sparkles } from 'lucide-react';

interface CreationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creations: SavedCreation[];
  onRefreshCreations: () => void;
  onRestoreCreation: (config: ShareConfig) => void;
}

function formatTime(timestamp: number, locale: string): string {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diffSec = Math.round((timestamp - Date.now()) / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (Math.abs(diffSec) < 60) return locale === 'fr' ? "À l'instant" : 'Just now';
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
    return rtf.format(diffDay, 'day');
  } catch {
    return new Date(timestamp).toLocaleDateString();
  }
}

export const CreationsModal: React.FC<CreationsModalProps> = ({
  isOpen,
  onClose,
  creations,
  onRefreshCreations,
  onRestoreCreation,
}) => {
  const { locale, t } = useI18n();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = creations.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.paletteName.toLowerCase().includes(q) ||
      c.deviceName.toLowerCase().includes(q) ||
      c.moduleName.toLowerCase().includes(q) ||
      c.theme.toLowerCase().includes(q)
    );
  });

  // Focus search input & lock body scroll when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyLink = (creation: SavedCreation, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = buildShareUrl(creation.config);
    navigator.clipboard.writeText(url);
    setCopiedId(creation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCreation(id);
    onRefreshCreations();
  };

  const handleClearAll = () => {
    const msg = locale === 'fr' 
      ? 'Voulez-vous vraiment effacer tout votre historique de créations ?' 
      : 'Are you sure you want to clear your creation history?';
    if (window.confirm(msg)) {
      clearAllCreations();
      onRefreshCreations();
    }
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="creations-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 dark:bg-black/60 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200/80 dark:border-white/10 p-4">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                <Layers size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="creations-modal-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t('creations.title')}
                  </h2>
                  <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.2 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                    {creations.length}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  {t('creations.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {creations.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="hidden sm:inline text-[11px] text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium px-2 py-1 transition cursor-pointer"
                >
                  {t('creations.clearAll')}
                </button>
              )}
              <span className="hidden rounded border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-neutral-400 sm:inline">
                ESC
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('creations.searchPlaceholder')}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-2 pl-9 pr-8 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Creations List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-neutral-500">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-slate-700 dark:text-neutral-300">
                  {search ? t('creations.noMatch') : t('creations.emptyTitle')}
                </h4>
                <p className="text-xs text-slate-400 dark:text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  {search ? t('creations.noMatchDesc') : t('creations.emptyDesc')}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onRestoreCreation(item.config);
                  onClose();
                }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50/60 dark:bg-white/[0.02] p-3 transition hover:border-sky-500/40 hover:bg-sky-500/[0.04] dark:hover:border-sky-500/30 cursor-pointer"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 bg-slate-900 shadow-sm">
                    <img
                      src={item.thumbnail}
                      alt={item.paletteName}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.paletteName}
                      </h4>
                      <span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-1.5 py-0.2 text-[9px] font-medium text-slate-600 dark:text-neutral-400 uppercase">
                        {item.theme}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-neutral-400">
                      <span>{item.deviceName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(item.createdAt, locale)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-1 sm:pt-0">
                  <button
                    onClick={(e) => handleCopyLink(item, e)}
                    title={t('creations.share')}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">{t('step5.copied')}</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={12} />
                        <span>{t('creations.share')}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    title={t('creations.delete')}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:text-neutral-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="text-sky-500 pl-1 opacity-0 group-hover:opacity-100 transition">
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] px-4 py-2.5 text-[11px] text-slate-500 dark:text-neutral-400 flex items-center justify-between">
          <span>{t('creations.clickToRestore')}</span>
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
            {creations.length} / 30 max
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
