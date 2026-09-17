import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, ShieldCheck, Zap, Sparkles, ArrowDownRight, Layers, ArrowUpRight } from 'lucide-react';
import { Pool, Position } from '../../types';
import { LiquidityDepthChart } from './LiquidityDepthChart';
import { useWallet } from '../../context/WalletContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface AddLiquidityModalProps {
  pool: Pool | null;
  isOpen: boolean;
  onClose: () => void;
  onAdded: (pos: Position) => void;
}

type LiquidityMode = 'dual' | 'single-usdc' | 'single-token';

export const AddLiquidityModal: React.FC<AddLiquidityModalProps> = ({
  pool,
  isOpen,
  onClose,
  onAdded,
}) => {
  const { isConnected, connectWallet, usdcBalance } = useWallet();

  // Mode: Dual sided, Single-sided USDC (dip buying), Single-sided Token (take profit)
  const [mode, setMode] = useState<LiquidityMode>('dual');

  // Compute accurate current price: token1 per token0
  const currentPrice = useMemo(() => {
    if (!pool) return 1.0;
    if (pool.token0Reserve > 0 && pool.token1Reserve > 0) {
      return pool.token1Reserve / pool.token0Reserve;
    }
    return 1.0;
  }, [pool]);

  const [minPrice, setMinPrice] = useState<number>(1.0);
  const [maxPrice, setMaxPrice] = useState<number>(1.0);
  const [amountUsdc, setAmountUsdc] = useState<string>('100');
  const [amountToken, setAmountToken] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize prices whenever pool changes or opens
  useEffect(() => {
    if (pool) {
      if (mode === 'dual') {
        setMinPrice(parseFloat((currentPrice * 0.8).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 1.2).toPrecision(5)));
        setAmountToken((parseFloat(amountUsdc || '100') * currentPrice).toFixed(2));
      } else if (mode === 'single-usdc') {
        // USDC single sided: price below current market (buying the dip)
        setMinPrice(parseFloat((currentPrice * 0.5).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 0.98).toPrecision(5)));
        setAmountToken('0');
      } else {
        // Token single sided: price above current market (take profit)
        setMinPrice(parseFloat((currentPrice * 1.02).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 1.5).toPrecision(5)));
        setAmountUsdc('0');
        setAmountToken('100');
      }
    }
  }, [pool?.id, currentPrice, mode]);

  // Calculate dynamic Estimated APR based on range concentration
  const { estimatedApr, multiplier } = useMemo(() => {
    const baseApr = pool ? pool.estFeeApr : 0;
    if (!pool || minPrice <= 0 || maxPrice === Infinity || maxPrice <= minPrice) {
      return { estimatedApr: baseApr, multiplier: 1.0 };
    }

    const spread = (maxPrice - minPrice) / currentPrice;
    let mult = 1.0;

    if (spread <= 0.2) mult = 12.5; // ±10%
    else if (spread <= 0.4) mult = 6.8; // ±20%
    else if (spread <= 0.6) mult = 4.2; // ±30%
    else if (spread <= 1.0) mult = 2.5; // ±50%
    else if (spread <= 1.4) mult = 1.8; // ±70%
    else if (spread <= 1.8) mult = 1.3; // ±90%
    else mult = 1.05;

    // In single-sided mode outside active price, LP fee is zero until price crosses range
    const isCurrentlyActive = currentPrice >= minPrice && currentPrice <= maxPrice;
    const finalApr = isCurrentlyActive ? baseApr * mult : baseApr * 0.85;

    return { estimatedApr: finalApr, multiplier: mult };
  }, [pool, minPrice, maxPrice, currentPrice]);

  if (!isOpen || !pool) return null;

  const isV4 = pool.version === 'v4';

  // Range preset shortcuts handler
  const handleRangePreset = (type: 'minus-20' | 'minus-30' | 'minus-50' | 'minus-70' | 'minus-90' | 'dual-10' | 'dual-20' | 'dual-50' | 'full') => {
    switch (type) {
      case 'minus-20':
        setMode('single-usdc');
        setMinPrice(parseFloat((currentPrice * 0.8).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 0.99).toPrecision(5)));
        break;
      case 'minus-30':
        setMode('single-usdc');
        setMinPrice(parseFloat((currentPrice * 0.7).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 0.99).toPrecision(5)));
        break;
      case 'minus-50':
        setMode('single-usdc');
        setMinPrice(parseFloat((currentPrice * 0.5).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 0.99).toPrecision(5)));
        break;
      case 'minus-70':
        setMode('single-usdc');
        setMinPrice(parseFloat((currentPrice * 0.3).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 0.99).toPrecision(5)));
        break;
      case 'minus-90':
        setMode('single-usdc');
        setMinPrice(parseFloat((currentPrice * 0.1).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 0.99).toPrecision(5)));
        break;
      case 'dual-10':
        setMode('dual');
        setMinPrice(parseFloat((currentPrice * 0.9).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 1.1).toPrecision(5)));
        break;
      case 'dual-20':
        setMode('dual');
        setMinPrice(parseFloat((currentPrice * 0.8).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 1.2).toPrecision(5)));
        break;
      case 'dual-50':
        setMode('dual');
        setMinPrice(parseFloat((currentPrice * 0.5).toPrecision(5)));
        setMaxPrice(parseFloat((currentPrice * 1.5).toPrecision(5)));
        break;
      case 'full':
        setMode('dual');
        setMinPrice(0);
        setMaxPrice(Infinity);
        break;
    }
  };

  // Quick capital deposit button handler
  const handleQuickAmount = (val: number) => {
    setAmountUsdc(val.toString());
    if (mode === 'dual') {
      setAmountToken((val * currentPrice).toFixed(2));
    } else if (mode === 'single-usdc') {
      setAmountToken('0');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));

      const uAmount = parseFloat(amountUsdc) || 0;
      const tAmount = parseFloat(amountToken) || 0;

      const newPos: Position = {
        id: `pos-${Date.now()}`,
        poolId: pool.id,
        version: pool.version,
        token0: pool.token0,
        token1: pool.token1,
        feeTier: pool.feeTier,
        feeDisplay: pool.feeDisplay,
        status: currentPrice >= minPrice && currentPrice <= maxPrice ? 'in-range' : 'out-of-range',
        minPrice,
        maxPrice,
        currentPrice,
        token0Amount: uAmount,
        token0ValueUsd: uAmount,
        token1Amount: tAmount,
        token1ValueUsd: tAmount * (currentPrice > 0 ? 1 / currentPrice : 1),
        totalValueUsd: uAmount + (tAmount * (currentPrice > 0 ? 1 / currentPrice : 1)),
        unclaimedFee0: 0,
        unclaimedFee1: 0,
        unclaimedFeeUsd: 0,
        liquidity: '284719284',
        tickLower: -84000,
        tickUpper: 84000,
      };

      onAdded(newPos);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden">
        {/* Header: Title + Protocol Version Badge (v3 / v4) */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-500 stroke-[2.5]" />
                <span>Add Liquidity · {pool.token0.symbol} / {pool.token1.symbol}</span>
              </h3>

              {/* Version Badge */}
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  isV4
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                }`}
              >
                {isV4 ? 'Uniswap v4' : 'Uniswap v3'}
              </span>

              {/* Hook Badge if v4 */}
              {pool.hook && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-600 border border-purple-200">
                  {pool.hook.name}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isV4 ? 'Concentrated liquidity on Uniswap v4 Singleton architecture.' : 'Concentrated liquidity on Uniswap v3 NFT Position Manager.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[85vh] overflow-y-auto">
          {/* Dynamic APR Banner with Multiplier */}
          <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Estimated Fee APR: <span className="text-base font-extrabold">{formatPercent(estimatedApr)}</span>
                </div>
                <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                  Capital Efficiency: <span className="font-bold">{multiplier.toFixed(1)}x multiplier</span> vs. Full Range
                </div>
              </div>
            </div>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              Fee Tier: {pool.feeDisplay}
            </span>
          </div>

          {/* Liquidity Mode Selector (Dual Sided vs Single Sided) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Liquidity Provision Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('dual')}
                className={`py-2 px-2.5 rounded-2xl text-xs font-bold border transition-all text-center ${
                  mode === 'dual'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Dual Sided (In-Range)
              </button>

              <button
                type="button"
                onClick={() => handleRangePreset('minus-20')}
                className={`py-2 px-2.5 rounded-2xl text-xs font-bold border transition-all text-center ${
                  mode === 'single-usdc'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Single Sided USDC
              </button>

              <button
                type="button"
                onClick={() => setMode('single-token')}
                className={`py-2 px-2.5 rounded-2xl text-xs font-bold border transition-all text-center ${
                  mode === 'single-token'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                Single Sided {pool.token1.symbol}
              </button>
            </div>
          </div>

          {/* Range Shortcut Presets: -20% -30% -50% -70% -90% (USDC Dip) & Dual ranges */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                USDC Dip & Concentration Shortcuts
              </span>
              <span className="text-[11px] text-slate-400">1-click range presets</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => handleRangePreset('minus-20')}
                className="py-1.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                title="Deposit USDC in range: -20% below current price"
              >
                -20% USDC
              </button>
              <button
                type="button"
                onClick={() => handleRangePreset('minus-30')}
                className="py-1.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                title="Deposit USDC in range: -30% below current price"
              >
                -30% USDC
              </button>
              <button
                type="button"
                onClick={() => handleRangePreset('minus-50')}
                className="py-1.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                title="Deposit USDC in range: -50% below current price"
              >
                -50% USDC
              </button>
              <button
                type="button"
                onClick={() => handleRangePreset('minus-70')}
                className="py-1.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                title="Deposit USDC in range: -70% below current price"
              >
                -70% USDC
              </button>
              <button
                type="button"
                onClick={() => handleRangePreset('minus-90')}
                className="py-1.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                title="Deposit USDC in range: -90% below current price"
              >
                -90% USDC
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleRangePreset('dual-10')}
                className="py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors"
              >
                ±10% (Tight)
              </button>
              <button
                type="button"
                onClick={() => handleRangePreset('dual-20')}
                className="py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors"
              >
                ±20% (Common)
              </button>
              <button
                type="button"
                onClick={() => handleRangePreset('dual-50')}
                className="py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors"
              >
                ±50% (Wide)
              </button>
              <button
                type="button"
                onClick={() => handleRangePreset('full')}
                className="py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Full Range
              </button>
            </div>
          </div>

          {/* Interactive Depth Chart */}
          <LiquidityDepthChart
            currentPrice={currentPrice}
            minPrice={minPrice}
            maxPrice={maxPrice}
            token0Symbol={pool.token0.symbol}
            token1Symbol={pool.token1.symbol}
            onChangeRange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            mode={mode}
          />

          {/* Price Boundaries Manual Input */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Min Price ({pool.token1.symbol} per {pool.token0.symbol})
              </label>
              <input
                type="number"
                step="any"
                value={minPrice}
                onChange={(e) => setMinPrice(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-mono font-bold text-slate-900 dark:text-white bg-transparent outline-none"
              />
            </div>

            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Max Price ({pool.token1.symbol} per {pool.token0.symbol})
              </label>
              <input
                type="number"
                step="any"
                value={maxPrice === Infinity ? '' : maxPrice}
                placeholder="∞"
                onChange={(e) => setMaxPrice(parseFloat(e.target.value) || Infinity)}
                className="w-full text-sm font-mono font-bold text-slate-900 dark:text-white bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Custom Deposit Capital Shortcuts: 50, 100, 250, 500 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Deposit Capital (USDC 6 desimal)
              </span>
              <div className="flex items-center gap-1">
                {[50, 100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Deposit 0 (USDC) */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 mb-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Deposit {pool.token0.symbol}</span>
                <span className="font-mono">Balance: {usdcBalance} USDC</span>
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  step="any"
                  value={amountUsdc}
                  onChange={(e) => {
                    setAmountUsdc(e.target.value);
                    if (mode === 'dual') {
                      const n = parseFloat(e.target.value) || 0;
                      setAmountToken((n * currentPrice).toFixed(2));
                    }
                  }}
                  placeholder="0.0"
                  className="w-full text-xl font-extrabold font-mono text-slate-900 dark:text-white bg-transparent outline-none"
                  required={mode !== 'single-token'}
                />
                <span className="font-bold text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-600">
                  {pool.token0.symbol}
                </span>
              </div>
            </div>

            {/* Input Deposit 1 (Counterpart Token) */}
            {mode !== 'single-usdc' && (
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Deposit {pool.token1.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="number"
                    step="any"
                    value={amountToken}
                    onChange={(e) => setAmountToken(e.target.value)}
                    placeholder="0.0"
                    className="w-full text-xl font-extrabold font-mono text-slate-900 dark:text-white bg-transparent outline-none"
                    required={mode === 'dual' || mode === 'single-token'}
                  />
                  <span className="font-bold text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600">
                    {pool.token1.symbol}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Gas Estimate */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Network Gas Fee ({isV4 ? 'v4 Singleton' : 'v3 NFT'})</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              ~0.003 <span className="text-rose-500">USDC</span>
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting
              ? 'Submitting to Arc Mainnet...'
              : isConnected
              ? mode === 'single-usdc'
                ? `Supply ${amountUsdc} USDC (Single-Sided Dip)`
                : `Supply Liquidity (${isV4 ? 'v4' : 'v3'})`
              : 'Connect Wallet'}
          </button>
        </form>
      </div>
    </div>
  );
};
