import React from 'react';
import { X, CheckCircle2, AlertCircle, Wrench, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FeatureStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureStatusModal: React.FC<FeatureStatusModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  const features = [
    {
      name: language === 'id' ? 'Eksekusi Dynamic Hooks Uniswap v4' : 'Uniswap v4 Dynamic Hooks Execution',
      status: 'dev',
      statusLabel: t.statusBadgeDev,
      desc: t.statusV4HooksDesc,
      tag: 'v4 Hooks Engine',
    },
    {
      name: language === 'id' ? 'Widget In-App Fast Bridge Arc' : 'Arc In-App Fast Bridge Widget',
      status: 'dev',
      statusLabel: t.statusBadgeDev,
      desc: t.statusBridgeDesc,
      tag: 'Cross-chain Bridge',
    },
    {
      name: language === 'id' ? 'Limit Orders & TWAP Otomatis' : 'Automated Limit Orders & TWAP',
      status: 'dev',
      statusLabel: t.statusBadgeDev,
      desc: t.statusLimitOrdersDesc,
      tag: 'DeFi Orders',
    },
    {
      name: language === 'id' ? 'Multi-hop Smart Order Routing (SOR)' : 'Multi-hop Smart Order Routing (SOR)',
      status: 'dev',
      statusLabel: t.statusBadgeDev,
      desc: t.statusSorDesc,
      tag: 'Swap Router',
    },
    {
      name: language === 'id' ? 'Dashboard Grafik Historis Subgraph' : 'Subgraph Historical Analytics Dashboard',
      status: 'dev',
      statusLabel: t.statusBadgeDev,
      desc: t.statusSubgraphDesc,
      tag: 'Data Analytics',
    },
    {
      name: language === 'id' ? 'Swap Langsung Uniswap v3 & v4 di Arc' : 'Direct Uniswap v3 & v4 Swaps on Arc',
      status: 'live',
      statusLabel: t.statusBadgeLive,
      desc: language === 'id' ? 'Swap token dengan gas USDC native (6 desimal) di Chain ID 5042.' : 'Token swaps with native USDC gas (6 decimals) on Chain ID 5042.',
      tag: 'Core DEX',
    },
    {
      name: language === 'id' ? 'Manajemen Likuiditas Terkonsentrasi v3' : 'v3 Concentrated Liquidity Management',
      status: 'live',
      statusLabel: t.statusBadgeLive,
      desc: language === 'id' ? 'Rentang kustom, Full Range, preset tick, penambahan, penarikan & klaim fee NFT.' : 'Custom ranges, Full Range, tick presets, add, decrease, and NFT fee collection.',
      tag: 'Liquidity Pools',
    },
    {
      name: language === 'id' ? 'Pencarian Omni-Search & Pintasan Keyboard' : 'Omni-Search & Pro Keyboard Shortcuts',
      status: 'live',
      statusLabel: t.statusBadgeLive,
      desc: language === 'id' ? 'Pencarian global Ctrl+K / /, navigasi instan tombol S/P/M/C/R/Esc/?.' : 'Global search Ctrl+K / /, instant navigation hotkeys S/P/M/C/R/Esc/?.',
      tag: 'Pro UX',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t.statusTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'id'
                  ? 'Transparansi status fitur siap pakai vs dalam pengembangan aktif'
                  : 'Transparency of live features vs. actively developing modules'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature List */}
        <div className="overflow-y-auto p-5 space-y-3">
          {features.map((f, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all ${
                f.status === 'dev'
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
                  : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  {f.status === 'dev' ? (
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {f.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    {f.tag}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      f.status === 'dev'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    }`}
                  >
                    {f.statusLabel}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-6">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0E131F] flex items-center justify-between">
          <a
            href="https://github.com/gamecore08/ARCADE_UniswapSDK"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>GitHub Repository</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
