import React, { useState } from 'react';
import { ArrowDownUp, Settings, ChevronDown, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Token } from '../../types';
import { useWallet } from '../../context/WalletContext';

interface SwapViewProps {
  onOpenTokenSelect: (target: 'in' | 'out') => void;
  tokenIn: Token;
  tokenOut: Token;
  onFlipTokens: () => void;
}

export const SwapView: React.FC<SwapViewProps> = ({
  onOpenTokenSelect,
  tokenIn,
  tokenOut,
  onFlipTokens,
}) => {
  const { isConnected, connectWallet, usdcBalance, isArcMainnet, switchToArc } = useWallet();

  const [amountIn, setAmountIn] = useState<string>('100');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Price conversion simulation based on realistic Arc ecosystem pairs
  const rate = tokenIn.symbol === 'USDC' && tokenOut.symbol === 'WETH'
    ? 1 / 3450
    : tokenIn.symbol === 'WETH' && tokenOut.symbol === 'USDC'
    ? 3450
    : tokenIn.symbol === 'USDC' && tokenOut.symbol === 'LONG'
    ? 136.05
    : tokenIn.symbol === 'LONG' && tokenOut.symbol === 'USDC'
    ? 0.00735
    : tokenIn.symbol === 'USDC' && tokenOut.symbol === 'POUNCH'
    ? 320930
    : 1.0;

  const numIn = parseFloat(amountIn) || 0;
  const numOut = numIn * rate;
  const amountOut = numOut > 0 ? (numOut < 0.0001 ? numOut.toPrecision(3) : numOut.toLocaleString('en-US', { maximumFractionDigits: 4 })) : '0.0';

  const priceImpact = numIn > 10000 ? 0.35 : 0.04;
  const minReceived = numOut * (1 - slippage / 100);

  const handleSwap = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    if (!isArcMainnet) {
      switchToArc();
      return;
    }

    setIsSwapping(true);
    try {
      await new Promise(r => setTimeout(r, 1200));

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#10b981', '#6366f1'],
        });
      } catch {}

      alert(`Successfully swapped ${amountIn} ${tokenIn.symbol} for ${amountOut} ${tokenOut.symbol} on Arc Mainnet!`);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-6">
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-xl p-5 space-y-3">
        {/* Card Header: Swap title & Settings */}
        <div className="flex items-center justify-between px-1 pb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Swap</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              v4 Singleton
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-2 z-30 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2B] shadow-xl p-4 text-xs space-y-3">
                <div className="font-bold text-slate-900 dark:text-white">Max Slippage</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.1, 0.5, 1.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlippage(s)}
                      className={`py-1.5 rounded-lg font-medium border text-center transition-all ${
                        slippage === s
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                  <button
                    onClick={() => setSlippage(2.0)}
                    className={`py-1.5 rounded-lg font-medium border text-center transition-all ${
                      slippage === 2.0
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* You Pay Section */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>You pay</span>
            {tokenIn.isNative && (
              <span className="font-mono">Balance: {usdcBalance} USDC</span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0"
              className="w-full text-2xl font-bold font-mono text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-300"
            />

            <button
              type="button"
              onClick={() => onOpenTokenSelect('in')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-rose-500/15 flex items-center justify-center text-[10px] font-bold text-rose-600 overflow-hidden">
                {tokenIn.logoUrl ? (
                  <img src={tokenIn.logoUrl} alt={tokenIn.symbol} className="w-full h-full object-cover" />
                ) : (
                  tokenIn.symbol.slice(0, 2)
                )}
              </div>
              <span className="font-bold text-xs text-slate-900 dark:text-white">{tokenIn.symbol}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Switch Tokens Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            type="button"
            onClick={onFlipTokens}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151B2B] text-slate-600 dark:text-slate-300 hover:text-rose-500 shadow-md hover:scale-110 active:scale-95 transition-all"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* You Receive Section */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>You receive</span>
            <span className="text-[11px] text-emerald-600 font-medium">Optimal Route</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="w-full text-2xl font-bold font-mono text-slate-900 dark:text-white truncate">
              {amountOut}
            </div>

            <button
              type="button"
              onClick={() => onOpenTokenSelect('out')}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition-all"
            >
              <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center text-[10px] font-bold text-blue-600 overflow-hidden">
                {tokenOut.logoUrl ? (
                  <img src={tokenOut.logoUrl} alt={tokenOut.symbol} className="w-full h-full object-cover" />
                ) : (
                  tokenOut.symbol.slice(0, 2)
                )}
              </div>
              <span className="font-bold text-xs text-slate-900 dark:text-white">{tokenOut.symbol}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Route Details Breakdown */}
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>Rate</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
              1 {tokenIn.symbol} ≈ {rate.toFixed(4)} {tokenOut.symbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>Price Impact</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              &lt; {priceImpact}%
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>Min Received ({slippage}%)</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">
              {minReceived.toFixed(4)} {tokenOut.symbol}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Network Gas (USDC)</span>
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              ~0.003 <span className="text-rose-500">USDC</span>
            </span>
          </div>
        </div>

        {/* Swap Action Button */}
        <button
          onClick={handleSwap}
          disabled={isSwapping || numIn <= 0}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isSwapping ? 'Swapping on Arc...' : !isConnected ? 'Connect Wallet' : !isArcMainnet ? 'Switch to Arc 5042' : 'Swap Tokens'}
        </button>
      </div>
    </div>
  );
};
