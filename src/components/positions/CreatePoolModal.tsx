import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { Token, HookInfo, Pool } from '../../types';
import { ARC_TOKENS, NATIVE_USDC } from '../../config/tokens';
import { ARC_CONTRACTS } from '../../config/contracts';
import { useWallet } from '../../context/WalletContext';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (pool: Pool) => void;
}

const AVAILABLE_HOOKS: HookInfo[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    name: 'No hook',
    description: 'Standard Uniswap v4 pool without custom hook logic.',
    type: 'none',
  },
  {
    address: '0x0A2Bf52DA5D72fd1B1cDB21ABd4Bd8672b512000',
    name: 'Dynamic Volatility Hook',
    description: 'Adjusts swap fee dynamically based on on-chain price volatility.',
    type: 'dynamic-fee',
  },
  {
    address: '0x0A122717bc36E3C7A7958128a5C789E0b070b3Ae',
    name: 'TWAMM Order Hook',
    description: 'Enables Time-Weighted Average Market Maker execution for large swap orders.',
    type: 'twamm',
  },
  {
    address: '0x542BCDA1015485ef0B1cD11B835DC58DF5102000',
    name: 'Limit Order Hook',
    description: 'Executes automated on-chain limit orders when price crosses tick thresholds.',
    type: 'limit-order',
  },
];

export const CreatePoolModal: React.FC<CreatePoolModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { isConnected, connectWallet, isArcMainnet } = useWallet();

  const [token0, setToken0] = useState<Token>(NATIVE_USDC);
  const [token1, setToken1] = useState<Token>(ARC_TOKENS.find(t => t.symbol === 'WETH') || ARC_TOKENS[1]);
  const [version, setVersion] = useState<'v4' | 'v3'>('v4');
  const [feeTier, setFeeTier] = useState<number>(3000); // 0.3%
  const [selectedHook, setSelectedHook] = useState<HookInfo>(AVAILABLE_HOOKS[0]);
  const [initialPrice, setInitialPrice] = useState<string>('3450.00');
  const [deposit0, setDeposit0] = useState<string>('100');
  const [deposit1, setDeposit1] = useState<string>('0.029');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const feeTiers = [
    { label: '0.01%', value: 100, desc: 'Best for very stable pairs' },
    { label: '0.05%', value: 500, desc: 'Stable pairs' },
    { label: '0.3%', value: 3000, desc: 'Most standard pairs' },
    { label: '1%', value: 10000, desc: 'Exotic / volatile pairs' },
    { label: '10%', value: 100000, desc: 'High fee meme pool' },
    { label: '20%', value: 200000, desc: 'Arc high fee pool' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate real on-chain transaction delay
      await new Promise(r => setTimeout(r, 1200));

      const newPool: Pool = {
        id: `arc-pool-${Date.now()}`,
        version,
        token0,
        token1,
        feeTier,
        feeDisplay: feeTiers.find(f => f.value === feeTier)?.label || `${feeTier / 10000}%`,
        hook: selectedHook.type !== 'none' ? selectedHook : undefined,
        liquidityUsd: parseFloat(deposit0) + parseFloat(deposit1) * parseFloat(initialPrice || '1'),
        token0Reserve: parseFloat(deposit0),
        token1Reserve: parseFloat(deposit1),
        volume24hUsd: 0,
        swapCount24h: 0,
        estFeeApr: 15.0,
        currentTick: 0,
        sqrtPriceX96: '79228162514264337593543950336',
        createdAtBlock: 21245300,
        poolAddress: ARC_CONTRACTS.v4.poolManager,
      };

      onCreated(newPool);
      onClose();
    } catch (err) {
      console.error('Failed to create pool:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>Create Liquidity Pool</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deploy a new Uniswap v3 or v4 pool on Arc Mainnet.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Version Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pool Protocol Version
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVersion('v4')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  version === 'v4'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Uniswap v4 (Hooks & Singleton)
              </button>
              <button
                type="button"
                onClick={() => setVersion('v3')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  version === 'v3'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                Uniswap v3 (Factory & NFTs)
              </button>
            </div>
          </div>

          {/* Token Pair Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Token Pair
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Token 0</span>
                <select
                  value={token0.symbol}
                  onChange={(e) => setToken0(ARC_TOKENS.find(t => t.symbol === e.target.value) || NATIVE_USDC)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                >
                  {ARC_TOKENS.map(t => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} ({t.name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Token 1</span>
                <select
                  value={token1.symbol}
                  onChange={(e) => setToken1(ARC_TOKENS.find(t => t.symbol === e.target.value) || ARC_TOKENS[1])}
                  className="w-full py-2 px-3 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                >
                  {ARC_TOKENS.map(t => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol} ({t.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fee Tier Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Fee Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {feeTiers.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFeeTier(f.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    feeTier === f.value
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{f.label}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* v4 Hooks Selector */}
          {version === 'v4' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Uniswap v4 Hook (Custom logic)
              </label>
              <div className="space-y-1.5">
                {AVAILABLE_HOOKS.map((hook) => (
                  <button
                    key={hook.name}
                    type="button"
                    onClick={() => setSelectedHook(hook)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                      selectedHook.name === hook.name
                        ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{hook.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{hook.description}</div>
                    </div>
                    {selectedHook.name === hook.name && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Initial Starting Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Starting Price ({token1.symbol} per {token0.symbol})
            </label>
            <input
              type="number"
              step="any"
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
              className="w-full py-2 px-3 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500"
              required
            />
          </div>

          {/* Initial Deposit amounts */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deposit {token0.symbol}
              </label>
              <input
                type="number"
                step="any"
                value={deposit0}
                onChange={(e) => setDeposit0(e.target.value)}
                className="w-full py-2 px-3 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deposit {token1.symbol}
              </label>
              <input
                type="number"
                step="any"
                value={deposit1}
                onChange={(e) => setDeposit1(e.target.value)}
                className="w-full py-2 px-3 rounded-xl text-xs font-mono border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          {/* Gas Estimate in USDC (6 decimals) */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Estimated Network Fee</span>
            </div>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              ~0.005 <span className="text-rose-500">USDC</span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting to Arc...' : isConnected ? 'Initialize & Create Pool' : 'Connect Wallet to Deploy'}
          </button>
        </form>
      </div>
    </div>
  );
};
