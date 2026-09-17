import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K (Windows) / ⌘K', desc: 'Omnibar search (tokens, pools, hooks)' },
    { key: 'S', desc: 'Navigate to Trade / Swap' },
    { key: 'P', desc: 'Navigate to Explore Pools' },
    { key: 'M', desc: 'Navigate to My Positions' },
    { key: 'C', desc: 'Open + Create Pool modal' },
    { key: 'R', desc: 'Trigger in-app data refresh (Zero F5 reload)' },
    { key: 'Esc', desc: 'Close open modal or dialog' },
    { key: '?', desc: 'Toggle this keyboard shortcut guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Keyboard className="w-5 h-5 text-rose-500" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 space-y-2.5">
          {shortcuts.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 text-xs"
            >
              <span className="text-slate-600 dark:text-slate-300">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-rose-600 dark:text-rose-400 shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
