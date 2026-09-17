import React, { useState } from 'react';
import { X, Search, ArrowRight, Droplets, Zap, Sparkles } from 'lucide-react';
import { Pool, Token } from '../../types';
import { ARC_TOKENS } from '../../config/tokens';

interface OmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  pools: Pool[];
  onSelectPool: (pool: Pool) => void;
  onSelectToken: (token: Token) => void;
  onNavigate: (view: 'swap' | 'pools') => void;
  onCreatePool: () => void;
}

export const OmniSearchModal: React.FC<OmniSearchModalProps> = ({
  isOpen,
  onClose,
  pools,
  onSelectPool,
  onSelectToken,
  onNavigate,
  onCreatePool,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchingPools = pools.filter(p =>
    p.token0.symbol.toLowerCase().includes(q) ||
    p.token1.symbol.toLowerCase().includes(q) ||
    p.poolAddress?.toLowerCase().includes(q) ||
    p.hook?.name.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchingTokens = ARC_TOKENS.filter(t =>
    t.symbol.toLowerCase().includes(q) ||
    t.name.toLowerCase().includes(q)
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tokens, pools, hooks, or quick actions..."
            className="w-full text-sm text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3">
          {/* Quick actions */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
              Quick Navigation
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onNavigate('swap');
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Go to Trade / Swap (S)</span>
              </button>
              <button
                onClick={() => {
                  onCreatePool();
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>Create Pool (C)</span>
              </button>
            </div>
          </div>

          {/* Pools */}
          {matchingPools.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                Pools
              </div>
              <div className="space-y-1">
                {matchingPools.map(pool => (
                  <div
                    key={pool.id}
                    onClick={() => {
                      onSelectPool(pool);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Droplets className="w-4 h-4 text-rose-500" />
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {pool.token0.symbol} / {pool.token1.symbol}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {pool.version}
                      </span>
                      {pool.hook && (
                        <span className="text-[10px] text-purple-600 font-medium">
                          {pool.hook.name}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tokens */}
          {matchingTokens.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                Tokens
              </div>
              <div className="space-y-1">
                {matchingTokens.map(token => (
                  <div
                    key={token.symbol}
                    onClick={() => {
                      onSelectToken(token);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-[10px] font-bold text-rose-600">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {token.symbol}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {token.name}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
