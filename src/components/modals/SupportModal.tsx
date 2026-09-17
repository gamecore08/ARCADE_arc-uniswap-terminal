import React, { useState } from 'react';
import { X, Copy, Check, Coffee, ExternalLink, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DonationAddress {
  chain: string;
  badge: string;
  iconBg: string;
  address: string;
  note: string;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [copiedChain, setCopiedChain] = useState<string | null>(null);

  if (!isOpen) return null;

  const addresses: DonationAddress[] = [
    {
      chain: 'Bitcoin (BTC)',
      badge: 'Native BTC',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      address: 'bc1qulgaaddxhl9qz5jcs4wu5tx5j3g9ng3lfd4cl0',
      note: language === 'id' ? 'Kirim koin Bitcoin native' : 'Send native Bitcoin',
    },
    {
      chain: 'EVM Multi-Chain',
      badge: 'Arc 5042 / ETH / Base / Arb / BSC',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      address: '0xFCDD187D32cFaecD8B07638BD6004fA2bF6838C6',
      note: language === 'id' ? 'Mendukung Arc Mainnet (USDC), ETH, Arbitrum, Base, Polygon, BSC' : 'Supports Arc Mainnet (USDC), ETH, Arbitrum, Base, Polygon, BSC',
    },
    {
      chain: 'Solana (SOL)',
      badge: 'SOL & SPL Tokens',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      address: '2zyBHgVYNp5WnKUK25WsdsQbsMzkj8Kzw2wDePWAnGZY',
      note: language === 'id' ? 'Mendukung SOL native dan token SPL (USDC, USDT)' : 'Supports native SOL and SPL tokens (USDC, USDT)',
    },
    {
      chain: 'Sui Network',
      badge: 'SUI Native & Tokens',
      iconBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      address: '0xfac84087048bf82f4f99c7704ee0cf9b1386c064b8ea845ab6baf65d1153eb09',
      note: language === 'id' ? 'Mendukung koin SUI dan ekosistem token Sui' : 'Supports SUI coin and Sui ecosystem tokens',
    },
  ];

  const handleCopy = (address: string, chain: string) => {
    navigator.clipboard.writeText(address);
    setCopiedChain(chain);
    setTimeout(() => {
      setCopiedChain(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{language === 'id' ? 'Dukung Proyek Ini' : 'Support This Project'}</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'id'
                  ? 'Bantu pengembangan fitur masa depan & pemeliharaan tools'
                  : 'Support future development, hosting, and ecosystem tooling'}
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

        {/* Address Cards */}
        <div className="overflow-y-auto p-5 space-y-3.5">
          {addresses.map((item) => {
            const isCopied = copiedChain === item.chain;

            return (
              <div
                key={item.chain}
                className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {item.chain}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(item.address, item.chain)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isCopied
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'id' ? 'Tersalin!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'id' ? 'Salin' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div
                  onClick={() => handleCopy(item.address, item.chain)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800/90 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all cursor-pointer hover:border-rose-300 dark:hover:border-rose-900 transition-colors select-all"
                  title="Klik untuk salin alamat"
                >
                  {item.address}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.note}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0E131F] flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {language === 'id' ? 'Terima kasih atas dukungannya! 🙏' : 'Thank you for supporting open source! 🙏'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            {language === 'id' ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
