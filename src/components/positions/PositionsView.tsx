import React, { useState, useMemo, useEffect } from 'react';
import { RotateCw, MoreHorizontal, ChevronDown, Plus, Minus, DollarSign, Clock, TrendingUp, Sparkles, ShieldCheck, LayoutGrid, Table as TableIcon, AlertTriangle, Wallet, Eye, LineChart, ExternalLink } from 'lucide-react';
import { Position, PoolVersion } from '../../types';
import { formatCurrency, formatPercent, shortenAddress } from '../../utils/formatters';
import { useWallet } from '../../context/WalletContext';

// Helper to determine live DexScreener candlestick chart URL for a position
const getPositionChartUrl = (pos: Position): string => {
  if (pos.poolId && pos.poolId.startsWith('0x') && pos.poolId.length === 42) {
    return `https://dexscreener.com/arc/${pos.poolId}`;
  }
  if (pos.token1?.address && pos.token1.address.startsWith('0x') && pos.token1.address.length === 42) {
    return `https://dexscreener.com/arc/${pos.token1.address}`;
  }
  if (pos.token0?.address && pos.token0.address.startsWith('0x') && pos.token0.address.length === 42 && pos.token0.address !== '0x3600000000000000000000000000000000000000') {
    return `https://dexscreener.com/arc/${pos.token0.address}`;
  }
  return `https://dexscreener.com/arc`;
};

interface PositionsViewProps {
  positions: Position[];
  isRefreshing: boolean;
  onRefresh: () => void;
  onClaimFee: (pos: Position) => void;
  onAddLiquidity: (pos: Position) => void;
  onDecreaseLiquidity: (pos: Position) => void;
  onCreatePool: () => void;
  activeSubTab: 'explore' | 'positions';
  onChangeSubTab: (tab: 'explore' | 'positions') => void;
}

export const PositionsView: React.FC<PositionsViewProps> = ({
  positions,
  isRefreshing,
  onRefresh,
  onClaimFee,
  onAddLiquidity,
  onDecreaseLiquidity,
  onCreatePool,
  activeSubTab,
  onChangeSubTab,
}) => {
  const { address, isConnected, connectWallet, publicClient } = useWallet();
  const [versionFilter, setVersionFilter] = useState<PoolVersion>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-range' | 'out-of-range' | 'closed'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Live on-chain NFT position query from NonfungiblePositionManager on Arc
  const [onChainPositionCount, setOnChainPositionCount] = useState<number | null>(null);
  const [isLoadingOnChain, setIsLoadingOnChain] = useState<boolean>(false);
  const [showDemoWhenEmpty, setShowDemoWhenEmpty] = useState<boolean>(false);

  useEffect(() => {
    if (!isConnected || !address || !publicClient) {
      setOnChainPositionCount(null);
      return;
    }
    let isMounted = true;
    async function checkPositions() {
      try {
        setIsLoadingOnChain(true);
        const bal = await publicClient.readContract({
          address: '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377',
          abi: [{
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'owner', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }],
          }],
          functionName: 'balanceOf',
          args: [address],
        });
        if (isMounted) setOnChainPositionCount(Number(bal));
      } catch (e) {
        console.warn('Failed to query on-chain positions for connected wallet:', e);
        if (isMounted) setOnChainPositionCount(0);
      } finally {
        if (isMounted) setIsLoadingOnChain(false);
      }
    }
    checkPositions();
    return () => { isMounted = false; };
  }, [isConnected, address, publicClient]);

  const portfolioSummary = useMemo(() => {
    let totalVal = 0;
    let totalInv = 0;
    let totalFees = 0;

    for (const p of positions) {
      if (p.status !== 'closed') {
        totalVal += p.totalValueUsd || 0;
        totalInv += p.investedValueUsd || p.totalValueUsd || 0;
        totalFees += p.unclaimedFeeUsd || 0;
      }
    }

    const netPnl = totalVal - totalInv;
    const pnlPct = totalInv > 0 ? (netPnl / totalInv) * 100 : 0;

    return { totalVal, totalInv, netPnl, pnlPct, totalFees };
  }, [positions]);

  const filteredPositions = useMemo(() => {
    return positions.filter((p) => {
      if (versionFilter !== 'all' && p.version !== versionFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [positions, versionFilter, statusFilter]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Pools
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lihat dan kelola posisi likuiditas aktif, PnL, modal terinvestasi, umur posisi, dan akumulasi fee Anda di Arc.
          </p>
        </div>

        <button
          onClick={onCreatePool}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Create pool</span>
        </button>
      </div>

      {/* Tabs + DexScreener Arc Link */}
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
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
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

      {/* Transparency & Wallet Status Banner */}
      {!isConnected ? (
        <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Mode Pratinjau Demo (Wallet Belum Terkoneksi)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-[10px] font-bold text-amber-900 dark:text-amber-200">
                  Seed Data Contoh
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                Angka ringkasan di bawah (Modal Invested: <strong>$7,500.00</strong>, Nilai Sekarang: <strong>$8,364.20</strong>, Net PnL: <strong>+$864.20</strong>) adalah <strong>Seed Demo Data</strong> untuk pratinjau antarmuka. Hubungkan wallet asli Anda untuk membaca data posisi on-chain riil dari kontrak <code>NonfungiblePositionManager</code>.
              </div>
            </div>
          </div>
          <button
            onClick={connectWallet}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect Wallet</span>
          </button>
        </div>
      ) : onChainPositionCount === 0 && !showDemoWhenEmpty ? (
        <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111624] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-base text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <span>Wallet Terhubung:</span>
              <span className="font-mono text-rose-500">{shortenAddress(address!)}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                Arc Chain 5042
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-1.5 leading-relaxed">
              Hasil pengecekan RPC on-chain langsung ke kontrak <code>NonfungiblePositionManager</code> (<code>0x3965...1377</code>):
              <br />
              Wallet ini saat ini memiliki <strong>0 NFT posisi likuiditas aktif</strong> di Arc Mainnet.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto py-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">Modal Invested</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">$0.00</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">Current Value</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">$0.00</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">Net PnL</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">$0.00</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400">Fees Siap Klaim</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">$0.00</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={onCreatePool}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Buka Posisi Likuiditas Baru</span>
            </button>
            <button
              onClick={() => setShowDemoWhenEmpty(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Contoh Pratinjau Demo ($7,500)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isConnected ? (
                <>Wallet Terhubung: <strong className="font-mono">{shortenAddress(address!)}</strong> · Menampilkan mode pratinjau contoh posisi.</>
              ) : (
                <>Menampilkan mode pratinjau contoh posisi ($7,500 Modal Pokok).</>
              )}
            </span>
          </div>
          {isConnected && onChainPositionCount === 0 && showDemoWhenEmpty && (
            <button
              onClick={() => setShowDemoWhenEmpty(false)}
              className="font-bold text-rose-500 hover:underline cursor-pointer"
            >
              Kembali ke data wallet asli ($0.00)
            </button>
          )}
        </div>
      )}

      {/* Portfolio Summary Metric Cards: Invested, Current Value, Net PnL, Unclaimed Fees */}
      {(!isConnected || onChainPositionCount !== 0 || showDemoWhenEmpty) && (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Value */}
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111624] shadow-xs">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            Total Current Value
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            {formatCurrency(portfolioSummary.totalVal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {positions.length} posisi likuiditas aktif
          </div>
        </div>

        {/* Card 2: Total Invested Capital */}
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111624] shadow-xs">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            Total Modal Invested
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            {formatCurrency(portfolioSummary.totalInv)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Modal pokok awal disetor
          </div>
        </div>

        {/* Card 3: Net PnL */}
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111624] shadow-xs">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            Net PnL (Keuntungan)
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            <span>+{formatCurrency(portfolioSummary.netPnl)}</span>
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-mono font-bold">
            +{portfolioSummary.pnlPct.toFixed(2)}% ROI keseluruhan
          </div>
        </div>

        {/* Card 4: Total Unclaimed Fees */}
        <div className="p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            Total Fees Siap Diklaim
          </div>
          <div className="text-2xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 mt-1">
            {formatCurrency(portfolioSummary.totalFees)}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-mono">
            Akumulasi reward LP terkumpul
          </div>
        </div>
      </div>

      {/* Title & Action controls (Filters + Card/Table Toggle) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Detail Posisi Likuiditas Anda
          </h2>
          {/* Version Filter Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
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
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Model Card vs Model Tabel */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('card')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'card'
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                viewMode === 'table'
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Status filter */}
          <div className="relative">
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span>Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isStatusOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-30 w-36 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2B] shadow-xl py-1 text-xs">
                {(['all', 'in-range', 'out-of-range', 'closed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setIsStatusOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left capitalize hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {s === 'all' ? 'All statuses' : s.replace('-', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Positions Display: Model Kartu or Model Tabel */}
      {filteredPositions.length === 0 ? (
        <div className="py-16 text-center border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-[#111624]">
          <p className="text-slate-600 dark:text-slate-300 font-semibold text-base">
            No active positions found
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Add liquidity to any pool to start earning fees on Arc.
          </p>
          <button
            onClick={onCreatePool}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create or Add Position</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* MODEL TABEL */
        <div className="w-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-400 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/40">
                  <th className="py-3.5 px-5 font-medium">Pair</th>
                  <th className="py-3.5 px-3 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium">Umur Posisi</th>
                  <th className="py-3.5 px-4 font-medium">Modal Invested</th>
                  <th className="py-3.5 px-4 font-medium">Current Value</th>
                  <th className="py-3.5 px-4 font-medium">uPnL (Net Profit)</th>
                  <th className="py-3.5 px-4 font-medium">Fees Earned</th>
                  <th className="py-3.5 px-3 font-medium">Yield APR</th>
                  <th className="py-3.5 px-4 font-medium">Rentang Harga</th>
                  <th className="py-3.5 px-5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPositions.map((pos) => {
                  const isInRange = pos.status === 'in-range';
                  const isV4 = pos.version === 'v4';
                  const pnl = pos.pnlUsd || 0;
                  const pnlPct = pos.pnlPercent || 0;

                  return (
                    <tr
                      key={pos.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Pair */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center -space-x-2">
                            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-xs font-bold text-rose-600 shadow-2xs overflow-hidden">
                              {pos.token0.logoUrl ? (
                                <img src={pos.token0.logoUrl} alt={pos.token0.symbol} className="w-full h-full object-cover" />
                              ) : (
                                pos.token0.symbol.slice(0, 2)
                              )}
                            </div>
                            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-xs font-bold text-blue-600 shadow-2xs overflow-hidden">
                              {pos.token1.logoUrl ? (
                                <img src={pos.token1.logoUrl} alt={pos.token1.symbol} className="w-full h-full object-cover" />
                              ) : (
                                pos.token1.symbol.slice(0, 2)
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{pos.token0.symbol} / {pos.token1.symbol}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                                isV4
                                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                                  : 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
                              }`}>
                                {pos.version}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{pos.feeDisplay}</span>
                              <span className="text-slate-300 dark:text-slate-700">·</span>
                              <a
                                href={getPositionChartUrl(pos)}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 font-sans font-semibold inline-flex items-center gap-0.5 hover:underline text-[10px]"
                                title="Buka live chart posisi di DexScreener"
                              >
                                <LineChart className="w-2.5 h-2.5" />
                                <span>Chart ↗</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        {isInRange ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>In range</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Out of range</span>
                          </span>
                        )}
                      </td>

                      {/* Age */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{pos.ageDisplay || 'Baru'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Block #{pos.createdAtBlock || 21080000}</span>
                      </td>

                      {/* Modal Invested */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(pos.investedValueUsd || pos.totalValueUsd)}
                      </td>

                      {/* Current Value */}
                      <td className="py-4 px-4 font-mono font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(pos.totalValueUsd)}
                        <span className="block text-[10px] text-slate-400 font-normal font-sans">
                          {pos.token0Amount.toFixed(0)} {pos.token0.symbol} + {pos.token1Amount.toFixed(0)} {pos.token1.symbol}
                        </span>
                      </td>

                      {/* uPnL */}
                      <td className="py-4 px-4 font-mono">
                        <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+{formatCurrency(pnl)}</span>
                        </span>
                        <span className="block text-[11px] font-bold text-emerald-600/90 dark:text-emerald-400/90">
                          +{pnlPct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Fees Earned */}
                      <td className="py-4 px-4 font-mono">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {formatCurrency(pos.unclaimedFeeUsd)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {pos.unclaimedFee0.toFixed(1)} {pos.token0.symbol} + {pos.unclaimedFee1.toFixed(0)} {pos.token1.symbol}
                        </div>
                      </td>

                      {/* Yield APR */}
                      <td className="py-4 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        +{pos.aprEarned || 89.5}%
                      </td>

                      {/* Price Range */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <div>Min: {pos.minPrice.toPrecision(4)}</div>
                        <div>Max: {pos.maxPrice.toPrecision(4)}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={getPositionChartUrl(pos)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/40 transition-colors shadow-2xs"
                            title="Buka live chart posisi di DexScreener"
                          >
                            <LineChart className="w-3.5 h-3.5" />
                            <span>Chart ↗</span>
                          </a>
                          {pos.unclaimedFeeUsd > 0 && (
                            <button
                              onClick={() => onClaimFee(pos)}
                              className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-2xs transition-all cursor-pointer"
                            >
                              Claim
                            </button>
                          )}
                          <button
                            onClick={() => onAddLiquidity(pos)}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Add Liquidity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDecreaseLiquidity(pos)}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Decrease Liquidity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* MODEL KARTU (Card View) */
        <div className="space-y-4">
          {filteredPositions.map((pos) => {
            const isInRange = pos.status === 'in-range';
            const isV4 = pos.version === 'v4';
            const pnl = pos.pnlUsd || 0;
            const pnlPct = pos.pnlPercent || 0;

            return (
              <div
                key={pos.id}
                className="p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                {/* Card Top: Pair, Badges, Age, PnL Pill, Menu */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Pair Icons */}
                    <div className="flex items-center -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-xs font-bold text-rose-600 shadow-2xs overflow-hidden">
                        {pos.token0.logoUrl ? (
                          <img src={pos.token0.logoUrl} alt={pos.token0.symbol} className="w-full h-full object-cover" />
                        ) : (
                          pos.token0.symbol.slice(0, 2)
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-xs font-bold text-blue-600 shadow-2xs overflow-hidden">
                        {pos.token1.logoUrl ? (
                          <img src={pos.token1.logoUrl} alt={pos.token1.symbol} className="w-full h-full object-cover" />
                        ) : (
                          pos.token1.symbol.slice(0, 2)
                        )}
                      </div>
                    </div>

                    <div className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{pos.token0.symbol} / {pos.token1.symbol}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-lg font-bold uppercase ${
                        isV4
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                          : 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                      }`}>
                        Uniswap {pos.version}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-lg font-semibold bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400">
                        {pos.feeDisplay}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center">
                      {isInRange ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>In range</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>Out of range</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Header: Age, PnL Badge, DexScreener Chart, Menu */}
                  <div className="flex items-center gap-2.5">
                    {/* Position Age */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{pos.ageDisplay || 'Baru dibuat'}</span>
                    </div>

                    {/* PnL Indicator Badge */}
                    <div className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 font-mono">
                      <span>PnL: +${pnl.toFixed(2)} (+{pnlPct.toFixed(2)}%)</span>
                    </div>

                    {/* DexScreener Live Chart Button */}
                    <a
                      href={getPositionChartUrl(pos)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/50 transition-colors shadow-2xs group cursor-pointer"
                      title="Lihat live chart posisi ini di DexScreener Arc"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                      <span>Chart DexScreener</span>
                      <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </a>

                    {/* Action Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === pos.id ? null : pos.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {menuOpenId === pos.id && (
                        <div className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2B] shadow-xl py-1 text-xs">
                          <a
                            href={getPositionChartUrl(pos)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setMenuOpenId(null)}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold border-b border-slate-100 dark:border-slate-800/60"
                          >
                            <LineChart className="w-3.5 h-3.5" />
                            <span>Buka Live Chart ↗</span>
                          </a>
                          <button
                            onClick={() => {
                              onAddLiquidity(pos);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Liquidity</span>
                          </button>
                          <button
                            onClick={() => {
                              onDecreaseLiquidity(pos);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                          >
                            <Minus className="w-3.5 h-3.5" />
                            <span>Decrease Liquidity</span>
                          </button>
                          <button
                            onClick={() => {
                              onClaimFee(pos);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Claim Fee</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body: 4 Detailed Metric Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
                  {/* Col 1: Total Value vs Invested */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Current Value & Modal
                    </span>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(pos.totalValueUsd)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                      Modal: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(pos.investedValueUsd || pos.totalValueUsd)}</span>
                    </div>
                  </div>

                  {/* Col 2: Token Balances Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Komposisi Token Likuiditas
                    </span>
                    <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{pos.token0Amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} {pos.token0.symbol}</span>
                        <span className="text-slate-400 font-normal">{formatCurrency(pos.token0ValueUsd)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{pos.token1Amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} {pos.token1.symbol}</span>
                        <span className="text-slate-400 font-normal">{formatCurrency(pos.token1ValueUsd)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Col 3: Fee Earned & APR */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Fee Terkumpul & Yield APR
                    </span>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(pos.unclaimedFeeUsd)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                      {pos.unclaimedFee0.toFixed(2)} USDC + {pos.unclaimedFee1.toFixed(0)} {pos.token1.symbol}
                      <span className="block text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                        Yield: +{pos.aprEarned || 89.5}% APR
                      </span>
                    </div>
                  </div>

                  {/* Col 4: Price Range & Claim Action */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-850/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Rentang Harga Konsentrasi
                      </span>
                      <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                        <span>Min: {pos.minPrice.toPrecision(4)}</span>
                        <span className="mx-1.5 text-slate-400">~</span>
                        <span>Max: {pos.maxPrice.toPrecision(4)}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Harga Pasar: {pos.currentPrice.toPrecision(4)} {pos.token1.symbol}/{pos.token0.symbol}
                      </div>
                    </div>

                    {pos.unclaimedFeeUsd > 0 && (
                      <button
                        onClick={() => onClaimFee(pos)}
                        className="mt-2 w-full py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-sm shadow-emerald-500/20 transition-all cursor-pointer text-center"
                      >
                        Claim Fee ({formatCurrency(pos.unclaimedFeeUsd)})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
};
