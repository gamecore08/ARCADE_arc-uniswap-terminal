import React, { useState, useEffect, useMemo } from 'react';
import { ExternalLink, ArrowUpRight, Plus, Droplets, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowUpDown, LineChart, Zap, Clock, Flame, AlertTriangle, Sparkles } from 'lucide-react';
import { Pool, PoolSortField, SortDirection } from '../../types';
import { formatCurrency, formatPercent, shortenAddress, formatFeeDisplay } from '../../utils/formatters';
import { buildDegenMetricsMap, PoolDegenMetrics } from '../../utils/degen';
import { useLanguage } from '../../context/LanguageContext';

interface PoolTableProps {
  pools: Pool[];
  allPools?: Pool[];
  sortField?: PoolSortField;
  sortDirection?: SortDirection;
  onSortChange?: (field: PoolSortField) => void;
  onSelectPool: (pool: Pool) => void;
  onAddLiquidity: (pool: Pool) => void;
  onTrade: (pool: Pool) => void;
}

export const PoolTable: React.FC<PoolTableProps> = ({
  pools,
  allPools,
  sortField,
  sortDirection,
  onSortChange,
  onSelectPool,
  onAddLiquidity,
  onTrade,
}) => {
  const { language, t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(pools.length / pageSize) || 1;

  // Build competition & degen metrics across all pools
  const degenMetricsMap = useMemo(() => {
    return buildDegenMetricsMap(allPools && allPools.length > 0 ? allPools : pools);
  }, [allPools, pools]);

  // Reset to page 1 whenever pool filtering or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pools.length, sortField, sortDirection]);

  const activePage = Math.min(currentPage, totalPages);
  const paginatedPools = pools.slice((activePage - 1) * pageSize, activePage * pageSize);

  const renderSortHeader = (label: string, field: PoolSortField, className: string = 'py-3.5 px-5 font-medium') => {
    const isActive = sortField === field;
    return (
      <th
        className={`${className} cursor-pointer select-none transition-colors group hover:text-slate-800 dark:hover:text-slate-200`}
        onClick={() => onSortChange?.(field)}
        title={`Klik untuk urutkan ${label} (${isActive ? (sortDirection === 'asc' ? 'Descending ▼' : 'Ascending ▲') : 'Asc/Desc'})`}
      >
        <div className="inline-flex items-center gap-1.5">
          <span className={isActive ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
            {label}
          </span>
          <span className="inline-flex items-center">
            {isActive ? (
              sortDirection === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
              )
            ) : (
              <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity" />
            )}
          </span>
        </div>
      </th>
    );
  };

  if (pools.length === 0) {
    return (
      <div className="py-16 text-center border border-slate-200/80 dark:border-slate-800 rounded-3xl bg-white dark:bg-[#111624] shadow-xs">
        <Droplets className="w-10 h-10 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
        <p className="text-slate-700 dark:text-slate-200 font-semibold text-base">
          {language === 'id' ? 'Tidak ada pool yang sesuai filter' : 'No pools matching your filters'}
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
          {language === 'id'
            ? 'Coba sesuaikan atau reset filter Fee minimal, TVL minimal, APR minimal, atau mode Degen.'
            : 'Try adjusting or resetting your Fee, TVL, APR or Degen filters.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse font-sans">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-400 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40">
              {renderSortHeader(t.poolsTablePool, 'pair', 'py-3.5 px-5 font-medium')}
              <th className="py-3.5 px-3 font-medium">{t.poolsTableProtocol}</th>
              {renderSortHeader(t.poolsTableFee, 'fee', 'py-3.5 px-3 font-medium')}
              {renderSortHeader(language === 'id' ? 'Umur / Status Degen' : 'Age / Degen Status', 'newest', 'py-3.5 px-4 font-medium')}
              {renderSortHeader(t.poolsTableTVL, 'liquidity', 'py-3.5 px-5 font-medium')}
              {renderSortHeader(t.poolsTableVol, 'volume', 'py-3.5 px-5 font-medium')}
              {renderSortHeader(t.poolsTableAPR, 'apr', 'py-3.5 px-5 font-medium')}
              <th className="py-3.5 px-5 font-medium">Hook</th>
              <th className="py-3.5 px-5 font-medium text-right">{t.poolsTableActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {paginatedPools.map((pool) => {
              const isV4 = pool.version === 'v4';
              const hasHook = !!pool.hook;

              // Pre-calculated Degen metrics
              const metric = degenMetricsMap.get(pool.id);
              const isDegen = metric?.isDegen ?? (pool.feeTier || 0) >= 100000;
              const isGolden = metric?.isGoldenWindow ?? false;
              const isDiluted = metric?.isDiluted ?? false;
              const isFresh = metric?.isFresh ?? false;
              const isRecent = metric?.isRecent ?? false;

              // Row background highlight
              let rowStyle = 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30';
              if (isGolden) {
                rowStyle = 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-l-4 border-amber-500 hover:from-amber-500/20';
              } else if (isDiluted) {
                rowStyle = 'bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent border-l-3 border-orange-500/70 hover:from-red-500/15';
              } else if (isDegen) {
                rowStyle = 'bg-orange-50/40 dark:bg-orange-950/20 border-l-2 border-orange-400 hover:bg-orange-50/70';
              } else if (isFresh) {
                rowStyle = 'bg-emerald-50/30 dark:bg-emerald-950/15 border-l-2 border-emerald-400 hover:bg-emerald-50/60';
              }

              return (
                <tr
                  key={pool.id}
                  className={`transition-colors group cursor-pointer ${rowStyle}`}
                  onClick={() => onSelectPool(pool)}
                >
                  {/* Pair */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-xs font-bold text-rose-600 shadow-xs overflow-hidden">
                          {pool.token0.logoUrl ? (
                            <img src={pool.token0.logoUrl} alt={pool.token0.symbol} className="w-full h-full object-cover" />
                          ) : (
                            pool.token0.symbol.slice(0, 2)
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-xs font-bold text-blue-600 shadow-xs overflow-hidden">
                          {pool.token1.logoUrl ? (
                            <img src={pool.token1.logoUrl} alt={pool.token1.symbol} className="w-full h-full object-cover" />
                          ) : (
                            pool.token1.symbol.slice(0, 2)
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5 flex-wrap">
                          <span>{pool.token0.symbol} / {pool.token1.symbol}</span>
                          
                          {/* DEGEN Tier Badge (≥ 10%) */}
                          {isDegen && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white shadow-xs">
                              <Zap className="w-2.5 h-2.5 fill-current" />
                              DEGEN {formatFeeDisplay(pool.feeDisplay, pool.feeTier)}
                            </span>
                          )}

                          {/* Fresh injection badge */}
                          {isFresh && !isDegen && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest bg-emerald-500 text-white animate-pulse">
                              🆕 NEW
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span>{shortenAddress(pool.poolAddress || pool.token0.address)}</span>
                          <a
                            href={`https://arc-scan.org/address/${pool.poolAddress || pool.token0.address}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500"
                            title="Buka di ArcScan"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-slate-300 dark:text-slate-700">·</span>
                          <a
                            href={pool.dexScreenerUrl || `https://dexscreener.com/arc/${pool.poolAddress || pool.id}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-sans font-semibold inline-flex items-center gap-0.5 hover:underline text-[10px]"
                            title="Buka live chart di DexScreener"
                          >
                            <LineChart className="w-2.5 h-2.5" />
                            <span>Chart ↗</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Version */}
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide ${
                        isV4
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {pool.version}
                    </span>
                  </td>

                  {/* Fee */}
                  <td className="py-4 px-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      isDegen
                        ? 'text-red-700 dark:text-red-300 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-950/60 dark:to-orange-950/60 border border-red-300 dark:border-red-800 shadow-2xs font-mono font-extrabold'
                        : (pool.feeTier || 0) >= 30000
                          ? 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/50 font-mono font-bold'
                          : (pool.feeTier || 0) >= 10000
                            ? 'text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/30 font-mono font-semibold'
                            : 'text-slate-700 dark:text-slate-300 font-mono'
                    }`}>
                      {formatFeeDisplay(pool.feeDisplay, pool.feeTier)}
                    </span>
                  </td>

                  {/* Umur & Sinyal Degen */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      <div
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                        title={`Dibuat: ${metric?.exactDateFormatted || 'Tidak diketahui'}`}
                      >
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{metric?.ageFormatted || '—'}</span>
                        {isFresh && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white animate-pulse leading-none">
                            BARU
                          </span>
                        )}
                      </div>

                      {/* Golden Window: No cheaper fee pool exists yet */}
                      {isGolden && (
                        <div 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs w-fit"
                          title={metric?.statusDescription}
                        >
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                          <span>🔥 Golden Window</span>
                        </div>
                      )}

                      {/* Diluted: Cheaper fee pools already appeared */}
                      {isDiluted && (
                        <div 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 w-fit"
                          title={metric?.statusDescription}
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>⚠️ Diluted ({metric?.lowerFeePoolCount} pool murah)</span>
                        </div>
                      )}

                      {/* Normal fresh pool */}
                      {!isDegen && isFresh && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Baru diinject (&lt; 24j)</span>
                        </span>
                      )}

                      {/* Regular pool date */}
                      {!isDegen && !isFresh && metric?.exactDateFormatted && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {metric.exactDateFormatted.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Total Liquidity */}
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(pool.liquidityUsd || 0)}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {(pool.token0Reserve || 0) >= 1000000 ? `${((pool.token0Reserve || 0) / 1000000).toFixed(2)}M` : (pool.token0Reserve || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} {pool.token0?.symbol || 'USDC'} + {(pool.token1Reserve || 0) >= 1000000 ? `${((pool.token1Reserve || 0) / 1000000).toFixed(2)}M` : (pool.token1Reserve || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} {pool.token1?.symbol || 'TOKEN'}
                    </div>
                  </td>

                  {/* Volume 24h */}
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(pool.volume24hUsd || 0)}
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {(pool.swapCount24h ?? pool.swaps24h ?? 0).toLocaleString('en-US')} swaps
                    </div>
                  </td>

                  {/* Est. Fee APR */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {formatPercent(pool.estFeeApr)}
                    </span>
                  </td>

                  {/* Hook */}
                  <td className="py-4 px-5">
                    {hasHook ? (
                      <span 
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200/80 dark:border-purple-800/50"
                        title={pool.hook?.description}
                      >
                        {pool.hook?.name}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        No hook
                      </span>
                    )}
                  </td>

                  {/* Quick Actions */}
                  <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <a
                        href={pool.dexScreenerUrl || `https://dexscreener.com/arc/${pool.poolAddress || pool.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/40 transition-colors shadow-2xs"
                        title="Buka live chart DexScreener di tab baru"
                      >
                        <LineChart className="w-3.5 h-3.5" />
                        <span>Chart ↗</span>
                      </a>
                      <button
                        onClick={() => onTrade(pool)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {t.poolsTrade}
                      </button>
                      <button
                        onClick={() => onAddLiquidity(pool)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 transition-colors"
                        title={t.poolsAddLiquidity}
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        {language === 'id' ? '+ Tambah' : '+ Add'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="py-3 px-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, pools.length)}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{pools.length}</span> pools
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-2 font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
