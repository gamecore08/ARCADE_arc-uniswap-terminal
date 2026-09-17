import React, { useState } from 'react';
import { X, Minus, ShieldCheck } from 'lucide-react';
import { Position } from '../../types';
import { useWallet } from '../../context/WalletContext';

interface DecreaseLiquidityModalProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
  onDecreased: (positionId: string, percentage: number) => void;
}

export const DecreaseLiquidityModal: React.FC<DecreaseLiquidityModalProps> = ({
  position,
  isOpen,
  onClose,
  onDecreased,
}) => {
  const { isConnected, connectWallet } = useWallet();
  const [percentage, setPercentage] = useState<number>(50);
  const [collectFees, setCollectFees] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !position) return null;

  const receive0 = (position.token0Amount * percentage) / 100;
  const receive1 = (position.token1Amount * percentage) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      onDecreased(position.id, percentage);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Minus className="w-5 h-5 text-rose-500" />
              <span>Remove / Decrease Liquidity</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Withdraw {position.token0.symbol} & {position.token1.symbol} from pool
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Percentage display */}
          <div className="text-center py-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {percentage}%
            </div>
            <div className="text-xs text-slate-400 mt-1">Amount to remove</div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="1"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />

          {/* Preset Buttons: 25%, 50%, 75%, Max */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPercentage(p)}
                className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  percentage === p
                    ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {p === 100 ? 'Max' : `${p}%`}
              </button>
            ))}
          </div>

          {/* Estimated receive */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 space-y-2 text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-300">You will receive:</div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{position.token0.symbol}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {receive0.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{position.token1.symbol}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {receive1.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </span>
            </div>

            {position.unclaimedFeeUsd > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={collectFees}
                    onChange={(e) => setCollectFees(e.target.checked)}
                    className="rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-emerald-600 font-medium">Also collect ${position.unclaimedFeeUsd.toFixed(2)} in fees</span>
                </label>
              </div>
            )}
          </div>

          {/* Gas Estimate */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Network Gas Fee</span>
            </div>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              ~0.004 <span className="text-rose-500">USDC</span>
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Removing Liquidity...' : isConnected ? 'Confirm Removal' : 'Connect Wallet'}
          </button>
        </form>
      </div>
    </div>
  );
};
