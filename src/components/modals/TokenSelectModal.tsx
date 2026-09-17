import React, { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { Token } from '../../types';
import { ARC_TOKENS } from '../../config/tokens';
import { shortenAddress } from '../../utils/formatters';

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: Token) => void;
  selectedToken?: Token;
}

export const TokenSelectModal: React.FC<TokenSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectToken,
  selectedToken,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = ARC_TOKENS.filter(
    t =>
      t.symbol.toLowerCase().includes(query.toLowerCase()) ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.address.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111624] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="text-base font-bold text-slate-900 dark:text-white">Select a token</div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or paste address"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Token List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 p-2">
          {filtered.map((token) => {
            const isSelected = selectedToken?.symbol === token.symbol;

            return (
              <div
                key={token.symbol}
                onClick={() => {
                  onSelectToken(token);
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-rose-50/70 dark:bg-rose-950/40 text-rose-600'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-xs font-bold text-rose-600 overflow-hidden">
                    {token.logoUrl ? (
                      <img src={token.logoUrl} alt={token.symbol} className="w-full h-full object-cover" />
                    ) : (
                      token.symbol.slice(0, 2)
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{token.symbol}</span>
                      {token.isNative && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600">
                          Gas
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {shortenAddress(token.address)}
                    </div>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-rose-500" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
