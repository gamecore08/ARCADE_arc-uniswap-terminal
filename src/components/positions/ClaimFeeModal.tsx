import React, { useState } from 'react';
import { X, DollarSign, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Position } from '../../types';
import { useWallet } from '../../context/WalletContext';

interface ClaimFeeModalProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimed: (positionId: string) => void;
}

export const ClaimFeeModal: React.FC<ClaimFeeModalProps> = ({
  position,
  isOpen,
  onClose,
  onClaimed,
}) => {
  const { isConnected, connectWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !position) return null;

  const handleClaim = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 900));

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#10b981', '#3b82f6'],
        });
      } catch {
        // ignore
      }

      onClaimed(position.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden text-center">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Claim Earned Fees</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <DollarSign className="w-7 h-7" />
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              ${position.unclaimedFeeUsd.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Available LP fees to harvest
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-mono text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{position.token0.symbol}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {position.unclaimedFee0.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{position.token1.symbol}:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {position.unclaimedFee1.toLocaleString('en-US', { maximumFractionDigits: 4 })}
              </span>
            </div>
          </div>

          {/* Gas Estimate */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gas Fee</span>
            </div>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              ~0.002 <span className="text-rose-500">USDC</span>
            </span>
          </div>

          {/* Claim Action */}
          <button
            onClick={handleClaim}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Claiming Fees...' : isConnected ? 'Collect to Wallet' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};
