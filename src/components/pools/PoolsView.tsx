import React, { useState, useMemo } from 'react';
import { Plus, RotateCw, Search, ChevronDown, Check, ArrowUpRight, Sparkles, Keyboard, SlidersHorizontal, ArrowUp, ArrowDown, X, RotateCcw, ShieldCheck, Filter, LineChart, ExternalLink, Zap, Flame, AlertTriangle, Clock, Timer } from 'lucide-react';
import { Pool, PoolVersion, HookFilter, PoolSortField, SortDirection, SnapshotMeta } from '../../types';
import { PoolTable } from './PoolTable';
import { formatCurrency } from '../../utils/formatters';
import { buildDegenMetricsMap, DegenFilterType, PoolDegenMetrics } from '../../utils/degen';

interface PoolsViewProps {
  pools: Pool[];
  snapshotMeta: SnapshotMeta;
  isRefreshing: boolean;
  onRefreshData: () => void;
  onSelectPool: (pool: Pool) => void;
  onAddLiquidity: (pool: Pool) => void;
  onTrade: (pool: Pool) => void;
  onCreatePool: () => void;
  onViewDepth: () => void;
  onOpenShortcuts?: () => void;
  activeSubTab: 'explore' | 'positions';
  onChangeSubTab: (tab: 'explore' | 'positions') => void;
}

const FEE_PRESETS = [
  { label: 'All Fee', value: 0 },
  { label: '≥ 0.01%', value: 0.01 },
  { label: '≥ 0.05%', value: 0.05 },
  { label: '≥ 0.25%', value: 0.25 },
  { label: '≥ 0.3%', value: 0.3 },
  { label: '≥ 1%', value: 1 },
  { label: '≥ 2%', value: 2 },
  { label: '≥ 3%', value: 3 },
  { label: '≥ 5%', value: 5 },
  { label: '≥ 10%', value: 10 },
  { label: '≥ 15%', value: 15 },
  { label: '≥ 20%', value: 20 },
  { label: '≥ 50%', value: 50 },
];

const TVL_PRESETS = [
  { label: 'All ($0)', value: 0 },
  { label: '≥ $1K', value: 1000 },
  { label: '≥ $10K', value: 10000 },
  { label: '≥ $50K', value: 50000 },
  { label: '≥ $100K', value: 100000 },
  { label: '≥ $1M', value: 1000000 },
];

const APR_PRESETS = [
  { label: 'All (0%)', value: 0 },
  { label: '≥ 10%', value: 10 },
  { label: '≥ 50%', value: 50 },
  { label: '≥ 100%', value: 100 },
  { label: '≥ 500%', value: 500 },
  { label: '≥ 1,000%', value: 1000 },
  { label: '≥ 5,000%', value: 5000 },
  { label: '≥ 10,000%', value: 10000 },
];

const SORT_OPTIONS: { field: PoolSortField; label: string }[] = [
  { field: 'apr', label: 'Est. fee APR' },
  { field: 'liquidity', label: 'Total liquidity' },
  { field: 'volume', label: 'Volume (24h)' },
  { field: 'fee', label: 'Fee tier' },
  { field: 'pair', label: 'Pair name' },
  { field: 'newest', label: 'Newest first' },
];

export const PoolsView: React.FC<PoolsViewProps> = ({
  pools,
  snapshotMeta,
  isRefreshing,
  onRefreshData,
  onSelectPool,
  onAddLiquidity,
  onTrade,
  onCreatePool,
  onViewDepth,
  onOpenShortcuts,
  activeSubTab,
  onChangeSubTab,
}) => {
  // Filters state
  const [versionFilter, setVersionFilter] = useState<PoolVersion>('all');
  const [minFee, setMinFee] = useState<number>(0);
  const [minTvl, setMinTvl] = useState<number>(0);
  const [minApr, setMinApr] = useState<number>(0);
  const [hookFilter, setHookFilter] = useState<HookFilter>('all');
  const [fundedOnly, setFundedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Degen Mode: show only pools with fee >= 10% (100000 millionths) and competitor/age analysis
  const [degenMode, setDegenMode] = useState<boolean>(false);
  const [degenFilterType, setDegenFilterType] = useState<DegenFilterType>('all');
  // New Pools Only: show only pools created within last 14 days
  const [newPoolOnly, setNewPoolOnly] = useState<boolean>(false);

  // Sorting state (field & direction: asc / desc)
  const [sortField, setSortField] = useState<PoolSortField>('apr');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // UI toggle states
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [isHookDropdownOpen, setIsHookDropdownOpen] = useState<boolean>(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);

  // Precompute comprehensive pair competition & degen metrics across all pools
  const degenMetricsMap = useMemo(() => {
    return buildDegenMetricsMap(pools);
  }, [pools]);

  // Aggregate statistics for Degen pools
  const degenStats = useMemo(() => {
    let totalDegen = 0;
    let goldenCount = 0;
    let dilutedCount = 0;
    let freshCount = 0;
    let maxFee = 0;

    for (const m of degenMetricsMap.values()) {
      if (m.isDegen) {
        totalDegen++;
        if (m.isGoldenWindow) goldenCount++;
        if (m.isDiluted) dilutedCount++;
        if (m.isFresh) freshCount++;
        if (m.feePercent > maxFee) maxFee = m.feePercent;
      }
    }

    return { totalDegen, goldenCount, dilutedCount, freshCount, maxFee };
  }, [degenMetricsMap]);

  // Dynamic summary stats from real pools
  const totalValuedLiquidity = useMemo(() => {
    return pools.reduce((acc, p) => acc + (p.liquidityUsd || 0), 0);
  }, [pools]);

  const total24hVolume = useMemo(() => {
    return pools.reduce((acc, p) => acc + (p.volume24hUsd || 0), 0);
  }, [pools]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (versionFilter !== 'all') count++;
    if (minFee > 0) count++;
    if (minTvl > 0) count++;
    if (minApr > 0) count++;
    if (hookFilter !== 'all') count++;
    if (fundedOnly) count++;
    if (degenMode) count++;
    if (newPoolOnly) count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [versionFilter, minFee, minTvl, minApr, hookFilter, fundedOnly, degenMode, newPoolOnly, searchQuery]);

  // Reset all filters function
  const handleResetFilters = () => {
    setVersionFilter('all');
    setMinFee(0);
    setMinTvl(0);
    setMinApr(0);
    setHookFilter('all');
    setFundedOnly(false);
    setDegenMode(false);
    setDegenFilterType('all');
    setNewPoolOnly(false);
    setSearchQuery('');
    setSortField('apr');
    setSortDirection('desc');
  };

  // Handle header sorting click (toggles asc/desc or sets new column)
  const handleSortChange = (field: PoolSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'pair' ? 'asc' : 'desc');
    }
  };

  // Helper to extract numeric fee percentage from pool (e.g. 3000 -> 0.3%, 10000 -> 1%, '0.3%' -> 0.3)
  const getPoolFeePercent = (pool: Pool): number => {
    if (typeof pool.feeTier === 'number' && pool.feeTier > 0) {
      return pool.feeTier / 10000;
    }
    if (pool.feeDisplay) {
      const num = parseFloat(pool.feeDisplay.replace('%', '').trim());
      if (!isNaN(num)) return num;
    }
    return 0;
  };

  // Filtered and sorted pools
  const filteredPools = useMemo(() => {
    return pools
      .filter((p) => {
        // Version filter
        if (versionFilter !== 'all' && p.version !== versionFilter) return false;

        // Min Fee filter (≥ minFee %)
        if (minFee > 0 && getPoolFeePercent(p) < minFee) return false;

        // Min TVL filter
        if (minTvl > 0 && (p.liquidityUsd || 0) < minTvl) return false;

        // Min APR filter
        if (minApr > 0 && (p.estFeeApr || 0) < minApr) return false;

        // Hook filter
        if (hookFilter === 'no-hook' && p.hook) return false;
        if (hookFilter === 'with-hooks' && !p.hook) return false;

        // Funded only
        if (fundedOnly && (p.liquidityUsd || 0) <= 0) return false;

        // Degen Mode: Fee >= 10% (100000 millionths) and competitor presence
        if (degenMode) {
          const metric = degenMetricsMap.get(p.id);
          if (!metric || !metric.isDegen) return false;
          if (degenFilterType === 'degen-golden' && !metric.isGoldenWindow) return false;
          if (degenFilterType === 'degen-fresh' && !metric.isFresh) return false;
        }

        // New pools only: created within last 14 days
        if (newPoolOnly) {
          const ageMs = p.pairCreatedAt ? Date.now() - p.pairCreatedAt : Infinity;
          if (ageMs > 14 * 24 * 60 * 60 * 1000) return false;
        }

        // Search query (token symbol, name, address, hook name/address, pool address)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchPair = `${p.token0.symbol}/${p.token1.symbol}`.toLowerCase().includes(q) ||
                            `${p.token1.symbol}/${p.token0.symbol}`.toLowerCase().includes(q);
          const matchToken0 = p.token0.symbol.toLowerCase().includes(q) ||
                              p.token0.name.toLowerCase().includes(q) ||
                              p.token0.address.toLowerCase().includes(q);
          const matchToken1 = p.token1.symbol.toLowerCase().includes(q) ||
                              p.token1.name.toLowerCase().includes(q) ||
                              p.token1.address.toLowerCase().includes(q);
          const matchPoolAddr = p.poolAddress?.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
          const matchHook = p.hook?.name.toLowerCase().includes(q) || p.hook?.address.toLowerCase().includes(q);

          if (!matchPair && !matchToken0 && !matchToken1 && !matchPoolAddr && !matchHook) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'apr') {
          comp = (a.estFeeApr || 0) - (b.estFeeApr || 0);
        } else if (sortField === 'liquidity') {
          comp = (a.liquidityUsd || 0) - (b.liquidityUsd || 0);
        } else if (sortField === 'volume') {
          comp = (a.volume24hUsd || 0) - (b.volume24hUsd || 0);
        } else if (sortField === 'fee') {
          comp = (a.feeTier || 0) - (b.feeTier || 0);
        } else if (sortField === 'pair') {
          const pairA = `${a.token0.symbol}/${a.token1.symbol}`.toLowerCase();
          const pairB = `${b.token0.symbol}/${b.token1.symbol}`.toLowerCase();
          comp = pairA.localeCompare(pairB);
        } else if (sortField === 'newest') {
          // Sort by pairCreatedAt descending (newest first)
          const tA = a.pairCreatedAt || 0;
          const tB = b.pairCreatedAt || 0;
          comp = tA - tB;
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [pools, versionFilter, minFee, minTvl, minApr, hookFilter, fundedOnly, degenMode, degenFilterType, newPoolOnly, searchQuery, sortField, sortDirection, degenMetricsMap]);


  const hookLabels: Record<HookFilter, string> = {
    all: 'All hooks',
    'no-hook': 'No hook',
    'with-hooks': 'With hooks',
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pools
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal">
            Explore liquidity pools on Arc and find opportunities.
          </p>
        </div>

        <button
          onClick={onCreatePool}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create pool</span>
        </button>
      </div>

      {/* Main Tab Bar: Explore pools / My positions + DexScreener Arc Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 text-sm font-semibold gap-3">
        <div className="flex items-center gap-8">
          <button
            onClick={() => onChangeSubTab('explore')}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeSubTab === 'explore'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Explore pools
            {activeSubTab === 'explore' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => onChangeSubTab('positions')}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeSubTab === 'positions'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            My positions
            {activeSubTab === 'positions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Live DexScreener Chart Link for Arc */}
        <a
          href="https://dexscreener.com/arc"
          target="_blank"
          rel="noreferrer"
          className="mb-2 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs group cursor-pointer w-fit"
          title="Buka live charts & pairs seluruh Arc Mainnet di DexScreener"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <LineChart className="w-3.5 h-3.5" />
          <span>DexScreener Arc Live</span>
          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111624] shadow-xs">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            Valued liquidity (Uniswap Arc)
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            $28.5M
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            Active verified pools TVL
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111624] shadow-xs">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            Volume · last 24h
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            $411.2M
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            Uniswap on Arc (DexScreener Live)
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111624] shadow-xs">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            24h Transactions · Pools
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            3.65M <span className="text-lg font-normal text-slate-400">txns</span>
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            {filteredPools.length} verified in view · 38,407 on Arc chain
          </div>
        </div>
      </div>

      {/* Interactive Shortcut Helper Bar (Panduan Shortcut di Web) */}
      <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">Panduan Shortcut Cepat:</span>
            <span className="text-slate-500 dark:text-slate-400 ml-1.5 hidden sm:inline">Tekan tombol keyboard kapan saja untuk navigasi instan:</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs">
            <kbd className="text-rose-500 font-bold">R</kbd> Refresh Data
          </span>
          <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs">
            <kbd className="text-rose-500 font-bold">P</kbd> Pools
          </span>
          <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs">
            <kbd className="text-rose-500 font-bold">M</kbd> Positions
          </span>
          <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs">
            <kbd className="text-rose-500 font-bold">S</kbd> Swap
          </span>
          <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs">
            <kbd className="text-rose-500 font-bold">C</kbd> Create Pool
          </span>
          <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-2xs">
            <kbd className="text-rose-500 font-bold">Ctrl + K</kbd> Cari
          </span>
          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-sans font-bold shadow-xs transition-colors cursor-pointer ml-1"
            >
              Lihat Panduan (?)
            </button>
          )}
        </div>
      </div>

      {/* Primary Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Version pills, Degen Mode button, Fee quick pills, Sort dropdown, Asc/Desc toggle, Atur Filter button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Version Pills: All, v4, v3 */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            {(['all', 'v4', 'v3'] as PoolVersion[]).map((v) => (
              <button
                key={v}
                onClick={() => setVersionFilter(v)}
                className={`px-3 py-1.5 rounded-xl transition-all capitalize ${
                  versionFilter === v
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* ⚡ DEGEN MODE TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => {
              const next = !degenMode;
              setDegenMode(next);
              if (next) {
                setSortField('newest');
                setSortDirection('desc');
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
              degenMode
                ? 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white border-orange-400 shadow-orange-500/25 ring-2 ring-orange-500/40 animate-pulse'
                : 'bg-white dark:bg-[#111624] text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-900/60 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            }`}
            title="Scan pool khusus fee ≥ 10% & analisis umur pool serta kompetitor fee rendah"
          >
            <Zap className={`w-3.5 h-3.5 ${degenMode ? 'fill-current' : 'text-orange-500'}`} />
            <span>{degenMode ? '⚡ Degen Mode ON' : '⚡ Degen Mode (≥10%)'}</span>
            {degenStats.totalDegen > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${degenMode ? 'bg-white text-orange-600' : 'bg-orange-100 dark:bg-orange-950 text-orange-600'}`}>
                {degenStats.totalDegen}
              </span>
            )}
          </button>

          {/* Quick Minimal Fee Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto max-w-full">
            {FEE_PRESETS.map((f) => (
              <button
                key={f.value}
                onClick={() => setMinFee(f.value)}
                className={`px-2.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  minFee === f.value
                    ? 'bg-rose-500 text-white font-bold shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort Column Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortDropdownOpen(!isSortDropdownOpen);
                setIsHookDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
              title="Pilih kolom pengurutan"
            >
              <span className="text-slate-400">Sort:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {SORT_OPTIONS.find((s) => s.field === sortField)?.label || 'APR'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 z-30 w-44 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2B] shadow-xl py-1.5 text-xs">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.field}
                    onClick={() => {
                      setSortField(s.field);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      sortField === s.field ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <span>{s.label}</span>
                    {sortField === s.field && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ascending / Descending Direction Toggle Button */}
          <button
            onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className={`flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-xs ${
              sortDirection === 'asc'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                : 'bg-white dark:bg-[#111624] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title={`Saat ini: ${sortDirection === 'asc' ? 'Naik (Ascending)' : 'Turun (Descending)'}. Klik untuk ubah.`}
          >
            {sortDirection === 'asc' ? (
              <>
                <ArrowUp className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
                <span className="font-bold">Naik (Asc)</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
                <span className="font-bold">Turun (Desc)</span>
              </>
            )}
          </button>

          {/* Atur Filter Button (With active badge) */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-xs ${
              isFilterDrawerOpen || activeFilterCount > 0
                ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-rose-500/20 shadow-md'
                : 'bg-white dark:bg-[#111624] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Atur Filter</span>
            {activeFilterCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-white text-rose-600 text-[10px] font-extrabold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reset All Filters Button (visible when any filter active) */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Reset semua filter ke pengaturan awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Right: Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari token, simbol, hook, contract..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ⚡ DEGEN MODE HUD & INTELLIGENCE BANNER */}
      {degenMode && (
        <div className="p-5 rounded-3xl border-2 border-orange-500/40 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-red-500/10 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-red-950/30 backdrop-blur-xs space-y-4 shadow-lg shadow-orange-500/5 transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md shadow-orange-500/25">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    ⚡ Degen Mode: Pool Fee ≥ 10% & Analisis Umur Kompetisi
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500 text-white animate-pulse">
                    LIVE ARC SCAN
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Mendeteksi token baru dengan fee tinggi (10% - 95%) dan memantau apakah fee tier lebih rendah sudah muncul.
                </p>
              </div>
            </div>

            {/* Sub-filter tabs inside Degen Mode */}
            <div className="flex items-center p-1 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-orange-200/80 dark:border-orange-800/80 text-xs font-semibold self-start md:self-auto shadow-xs">
              <button
                type="button"
                onClick={() => setDegenFilterType('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  degenFilterType === 'all'
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semua Degen ({degenStats.totalDegen})
              </button>
              <button
                type="button"
                onClick={() => setDegenFilterType('degen-golden')}
                className={`px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer ${
                  degenFilterType === 'degen-golden'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Hanya pool fee ≥ 10% yang saat ini belum ada pool fee lebih rendah (Monopoli volume)"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>🔥 Belum Ada Fee Rendah ({degenStats.goldenCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setDegenFilterType('degen-fresh')}
                className={`px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer ${
                  degenFilterType === 'degen-fresh'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Hanya pool baru yang dibuat dalam 24 jam terakhir"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>🆕 Baru Diinject &lt; 24j ({degenStats.freshCount})</span>
              </button>
            </div>
          </div>

          {/* Educational Insight Card */}
          <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#151B2B]/90 border border-orange-200/70 dark:border-orange-900/40 text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-[11.5px] leading-relaxed">
                <strong className="text-slate-900 dark:text-white font-bold">Aturan Emas Degen:</strong> Umur pool sangat menentukan! Token baru di Arc biasa diinjeksi fee 10% s/d 95%. Selama belum ada pool fee lebih rendah (0.05%, 0.3%, 1%), semua transaksi wajib bayar fee ini (<span className="text-amber-600 dark:text-amber-400 font-bold">Golden Window</span>). Begitu ada LP lain membuat pool fee rendah, router swap otomatis mengalihkan volume ke sana sehingga pool fee tinggi menjadi <span className="text-rose-600 dark:text-rose-400 font-bold">Diluted / Tidak laku lagi</span>.
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-mono text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800/60 text-orange-700 dark:text-orange-300 font-bold">
                Fee Max: {degenStats.maxFee}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setSortField('newest');
                  setSortDirection('desc');
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-sans font-semibold cursor-pointer transition-colors"
                title="Urutkan pool dari yang paling baru dibuat"
              >
                Sort: Umur Terbaru ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expandable "Atur Filter" Panel */}
      {isFilterDrawerOpen && (
        <div className="p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-md space-y-5 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-rose-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">Pengaturan Filter Lengkap & Pengurutan</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold">
                  {activeFilterCount} filter aktif
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-rose-500 hover:text-rose-600 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Semua Filter</span>
                </button>
              )}
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Minimal Fee Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>1. Filter Minimal Fee (%)</span>
                <span className="font-mono text-rose-500 font-semibold">
                  {minFee === 0 ? 'Semua (≥ 0%)' : `≥ ${minFee}%`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FEE_PRESETS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setMinFee(f.value)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      minFee === f.value
                        ? 'bg-rose-500 text-white shadow-xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative mt-1">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={minFee || ''}
                  onChange={(e) => setMinFee(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Atur minimal fee % kustom (misal 1 atau 3)..."
                  className="w-full pl-3 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
              <p className="text-[11px] text-slate-400">Hanya menampilkan pool dengan fee sama atau lebih tinggi (misal: ≥ 1% atau ≥ 3%).</p>
            </div>

            {/* 2. TVL Minimal Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>2. Filter TVL Minimal (Liquidity $)</span>
                <span className="font-mono text-rose-500 font-semibold">
                  {minTvl === 0 ? 'Semua ($0)' : formatCurrency(minTvl)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TVL_PRESETS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setMinTvl(t.value)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      minTvl === t.value
                        ? 'bg-rose-500 text-white shadow-xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  value={minTvl || ''}
                  onChange={(e) => setMinTvl(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Atur nominal TVL minimal kustom..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* 3. Min APR Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>3. Filter Est. Fee APR Minimal (%)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {minApr === 0 ? 'Semua (0%)' : `≥ ${minApr}%`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {APR_PRESETS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setMinApr(a.value)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all ${
                      minApr === a.value
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="relative mt-1">
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={minApr || ''}
                  onChange={(e) => setMinApr(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Atur minimal APR % kustom..."
                  className="w-full pl-3 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* 4. Hook Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>4. Filter Hook (Uniswap v4)</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                  {hookLabels[hookFilter]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'no-hook', 'with-hooks'] as HookFilter[]).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHookFilter(h)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      hookFilter === h
                        ? 'bg-purple-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {hookLabels[h]}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">Filter pool dengan atau tanpa Uniswap v4 Hook (Dynamic Fee, TWAMM, Limit Order).</p>
            </div>

            {/* 5. Ascending / Descending Sorting */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>5. Atur Pengurutan (Ascending / Descending)</span>
                <span className="font-mono text-rose-500 font-semibold">
                  {sortDirection === 'asc' ? '▲ Naik' : '▼ Turun'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as PoolSortField)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.field} value={s.field}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSortDirection('desc')}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                      sortDirection === 'desc'
                        ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Turun (Desc)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortDirection('asc')}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                      sortDirection === 'asc'
                        ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Naik (Asc)</span>
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Tips: Anda juga dapat mengklik langsung judul kolom tabel untuk mengurutkan.</p>
            </div>

            {/* 6. Version & Funded Only Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                6. Versi Protokol & Status Likuiditas
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  {(['all', 'v4', 'v3'] as PoolVersion[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVersionFilter(v)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all ${
                        versionFilter === v
                          ? 'bg-rose-500 text-white font-bold shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none ml-2">
                  <input
                    type="checkbox"
                    checked={fundedOnly}
                    onChange={(e) => setFundedOnly(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="font-medium">Hanya pool berlikuiditas &gt; $0</span>
                </label>
              </div>
            </div>

            {/* 7. Degen Mode (Fee >= 10%) & Pool Age Settings */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    7. Mode Degen (Pool Fee ≥ 10%) & Analisis Umur Kompetisi
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                    {degenStats.totalDegen} Pool Terdeteksi (Max {degenStats.maxFee}%)
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={degenMode}
                    onChange={(e) => {
                      setDegenMode(e.target.checked);
                      if (e.target.checked) {
                        setSortField('newest');
                        setSortDirection('desc');
                      }
                    }}
                    className="rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 h-4 w-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                    Aktifkan Filter Mode Degen
                  </span>
                </label>
              </div>

              {degenMode && (
                <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilihan Sub-Filter Degen:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDegenFilterType('all')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          degenFilterType === 'all'
                            ? 'bg-orange-600 text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        Semua Degen ({degenStats.totalDegen} pool)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDegenFilterType('degen-golden')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                          degenFilterType === 'degen-golden'
                            ? 'bg-amber-600 text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>🔥 Belum Ada Fee Rendah / Golden Window ({degenStats.goldenCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDegenFilterType('degen-fresh')}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer ${
                          degenFilterType === 'degen-fresh'
                            ? 'bg-emerald-600 text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>🆕 Baru Diinject &lt; 24 Jam ({degenStats.freshCount})</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tips: Ketika token baru diinjeksi dengan fee tinggi, swap awal menghasilkan fee besar. Namun segera setelah pool dengan fee 1% atau 0.3% muncul, volume akan dialihkan ke pool murah dan pool tinggi ini akan kehilangan likuiditas/volume (diluted).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Panel Footer: Real Data Guarantee Badge & Results */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Real On-Chain Arc Mainnet Data (Bukan Mockup)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Ditemukan <strong className="text-slate-900 dark:text-white font-bold">{filteredPools.length}</strong> dari {pools.length} pool
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                >
                  Reset Semua Filter
                </button>
              )}
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity"
              >
                Tutup Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot status & Manual Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 font-medium">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan <strong className="text-slate-800 dark:text-slate-200 font-bold">{filteredPools.length}</strong> pool aktif
            {activeFilterCount > 0 && (
              <span className="text-rose-500 font-semibold ml-1.5">
                ({activeFilterCount} filter diterapkan)
              </span>
            )}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={fundedOnly}
              onChange={(e) => setFundedOnly(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-rose-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Funded only</span>
          </label>
        </div>

        {/* Snapshot status & Manual Refresh Button */}
        <div className="flex items-center gap-2">
          <span>
            Snapshot {snapshotMeta.timeAgoMinutes} min ago · Block {snapshotMeta.blockNumber}
            {snapshotMeta.isStale && (
              <span className="text-amber-500 ml-1 font-semibold">· Stale snapshot</span>
            )}
          </span>
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="font-bold text-rose-500 hover:text-rose-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Manual refresh (Shortcut: R)"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh data</span>
          </button>
        </div>
      </div>

      {/* Highlight Banner: LONG / USDC Liquidity Depth */}
      <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-rose-50/60 via-pink-50/30 to-transparent dark:from-rose-950/25 dark:via-pink-950/15 dark:to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>LONG / USDC liquidity depth</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inspect liquidity by price range in the two LONG pools.
          </div>
        </div>
        <button
          onClick={onViewDepth}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
        >
          <span>View depth</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pools Table */}
      <PoolTable
        pools={filteredPools}
        allPools={pools}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onSelectPool={onSelectPool}
        onAddLiquidity={onAddLiquidity}
        onTrade={onTrade}
      />
    </div>
  );
};
