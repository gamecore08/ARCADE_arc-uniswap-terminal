import React from 'react';
import { Search, Moon, Sun, Wallet, ExternalLink, AlertTriangle, Keyboard, Globe, Wrench } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { shortenAddress } from '../utils/formatters';

interface NavbarProps {
  activeTab: 'swap' | 'pools';
  onSelectTab: (tab: 'swap' | 'pools') => void;
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenShortcuts: () => void;
  onOpenFeatureStatus: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  isDark,
  onToggleTheme,
  onOpenShortcuts,
  onOpenFeatureStatus,
}) => {
  const { address, isConnected, isConnecting, isArcMainnet, usdcBalance, connectWallet, switchToArc } = useWallet();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0E131F]/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <div 
            onClick={() => onSelectTab('pools')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" viewBox="0 0 100 100" fill="currentColor">
                <path d="M35 70 L50 28 L65 70 L50 56 Z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              ARCADE
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onSelectTab('swap')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'swap'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {t.navTrade}
            </button>
            <button
              onClick={() => onSelectTab('pools')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'pools'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {t.navPool}
            </button>
            <a
              href="https://arc-scan.org"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-1.5 transition-all"
            >
              <span>{t.navBridge}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50">
                {t.navDevBadge}
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href="https://developers.uniswap.org/docs/protocols/v4/deployments"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-1 transition-all"
            >
              {t.navDocs}
            </a>
            <a
              href="https://arc-scan.org"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-1 transition-all"
            >
              {t.navExplore}
            </a>
          </nav>
        </div>

        {/* Center: Search trigger */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/50 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="truncate">{t.navSearchPlaceholder}</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Network, Language Toggle, Status Modal, Theme Toggle, Wallet */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Network indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Arc 5042</span>
          </div>

          {/* Language Switcher (EN / ID) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
            title={language === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-rose-500" />
            <span>{language === 'en' ? '🇬🇧 EN' : '🇮🇩 ID'}</span>
          </button>

          {/* Feature Status Modal Button */}
          <button
            onClick={onOpenFeatureStatus}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300/80 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold text-amber-800 dark:text-amber-300 transition-colors"
            title={language === 'id' ? 'Lihat status fitur & roadmap pengembangan' : 'View feature status & development roadmap'}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Status Fitur' : 'Dev Status'}</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Panduan Shortcut Button */}
          <button
            onClick={onOpenShortcuts}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Buka panduan shortcut keyboard (?)"
          >
            <Keyboard className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.navShortcutsGuide}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500">?</kbd>
          </button>

          {/* Wallet Button */}
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? t.navConnecting : t.navConnectWallet}</span>
            </button>
          ) : !isArcMainnet ? (
            <button
              onClick={switchToArc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t.navSwitchToArc}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-300 font-mono">
                {usdcBalance} <span className="text-rose-500 font-semibold">USDC</span>
              </span>
              <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 font-mono">
                {shortenAddress(address!)}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
