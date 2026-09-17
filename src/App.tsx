import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PoolsView } from './components/pools/PoolsView';
import { PositionsView } from './components/positions/PositionsView';
import { SwapView } from './components/swap/SwapView';
import { CreatePoolModal } from './components/positions/CreatePoolModal';
import { AddLiquidityModal } from './components/positions/AddLiquidityModal';
import { DecreaseLiquidityModal } from './components/positions/DecreaseLiquidityModal';
import { ClaimFeeModal } from './components/positions/ClaimFeeModal';
import { TokenSelectModal } from './components/modals/TokenSelectModal';
import { OmniSearchModal } from './components/modals/OmniSearchModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { FeatureStatusModal } from './components/modals/FeatureStatusModal';
import { SupportModal } from './components/modals/SupportModal';
import { useArcData } from './hooks/useArcData';
import { useShortcuts } from './hooks/useShortcuts';
import { PoolIndexerService } from './services/poolIndexer';
import { Pool, Position, Token } from './types';
import { ARC_TOKENS, NATIVE_USDC } from './config/tokens';
import { Keyboard, Coffee } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'swap' | 'pools'>('pools');
  const [poolsSubTab, setPoolsSubTab] = useState<'explore' | 'positions'>('explore');

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('arcade_theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('arcade_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('arcade_theme', 'light');
    }
  }, [isDark]);

  // Data hook (TanStack Query with manual-only refetch)
  const { pools, positions, snapshotMeta, isRefreshing, handleManualRefresh } = useArcData();

  // Active selections for Modals
  const [selectedPoolForAdd, setSelectedPoolForAdd] = useState<Pool | null>(null);
  const [selectedPosForDecrease, setSelectedPosForDecrease] = useState<Position | null>(null);
  const [selectedPosForClaim, setSelectedPosForClaim] = useState<Position | null>(null);

  // Modal open states
  const [isCreatePoolOpen, setIsCreatePoolOpen] = useState(false);
  const [isAddLiquidityOpen, setIsAddLiquidityOpen] = useState(false);
  const [isDecreaseOpen, setIsDecreaseOpen] = useState(false);
  const [isClaimFeeOpen, setIsClaimFeeOpen] = useState(false);
  const [isTokenSelectOpen, setIsTokenSelectOpen] = useState(false);
  const [tokenSelectTarget, setTokenSelectTarget] = useState<'in' | 'out'>('in');
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isFeatureStatusOpen, setIsFeatureStatusOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Swap tokens
  const [tokenIn, setTokenIn] = useState<Token>(NATIVE_USDC);
  const [tokenOut, setTokenOut] = useState<Token>(ARC_TOKENS.find(t => t.symbol === 'WETH') || ARC_TOKENS[1]);

  // Keyboard shortcuts
  useShortcuts({
    onOpenSearch: () => setIsOmniSearchOpen(true),
    onGoSwap: () => setActiveTab('swap'),
    onGoPools: () => {
      setActiveTab('pools');
      setPoolsSubTab('explore');
    },
    onGoPositions: () => {
      setActiveTab('pools');
      setPoolsSubTab('positions');
    },
    onOpenCreatePool: () => setIsCreatePoolOpen(true),
    onRefresh: handleManualRefresh,
    onEscape: () => {
      setIsCreatePoolOpen(false);
      setIsAddLiquidityOpen(false);
      setIsDecreaseOpen(false);
      setIsClaimFeeOpen(false);
      setIsTokenSelectOpen(false);
      setIsOmniSearchOpen(false);
      setIsShortcutsHelpOpen(false);
      setIsFeatureStatusOpen(false);
      setIsSupportOpen(false);
    },
    onToggleHelp: () => setIsShortcutsHelpOpen(prev => !prev),
  });

  const handleCreatedPool = (newPool: Pool) => {
    PoolIndexerService.addPool(newPool);
    handleManualRefresh();
  };

  const handleAddedPosition = (newPos: Position) => {
    PoolIndexerService.addPosition(newPos);
    handleManualRefresh();
  };

  const handleDecreasedLiquidity = (posId: string, pct: number) => {
    PoolIndexerService.decreaseLiquidity(posId, pct);
    handleManualRefresh();
  };

  const handleClaimedFee = (posId: string) => {
    PoolIndexerService.claimPositionFee(posId);
    handleManualRefresh();
  };

  const handleTradePool = (pool: Pool) => {
    setTokenIn(pool.token0);
    setTokenOut(pool.token1);
    setActiveTab('swap');
  };

  const handleAddLiquidityPool = (pool: Pool) => {
    setSelectedPoolForAdd(pool);
    setIsAddLiquidityOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSearch={() => setIsOmniSearchOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenShortcuts={() => setIsShortcutsHelpOpen(true)}
        onOpenFeatureStatus={() => setIsFeatureStatusOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'swap' ? (
          <SwapView
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            onOpenTokenSelect={(target) => {
              setTokenSelectTarget(target);
              setIsTokenSelectOpen(true);
            }}
            onFlipTokens={() => {
              const temp = tokenIn;
              setTokenIn(tokenOut);
              setTokenOut(temp);
            }}
          />
        ) : poolsSubTab === 'explore' ? (
          <PoolsView
            pools={pools}
            snapshotMeta={snapshotMeta}
            isRefreshing={isRefreshing}
            onRefreshData={handleManualRefresh}
            onSelectPool={handleAddLiquidityPool}
            onAddLiquidity={handleAddLiquidityPool}
            onTrade={handleTradePool}
            onCreatePool={() => setIsCreatePoolOpen(true)}
            onViewDepth={() => {
              const argusPool = pools.find(p => p.token1.symbol === 'ARGUS') || pools[0];
              handleAddLiquidityPool(argusPool);
            }}
            onOpenShortcuts={() => setIsShortcutsHelpOpen(true)}
            onOpenFeatureStatus={() => setIsFeatureStatusOpen(true)}
            activeSubTab={poolsSubTab}
            onChangeSubTab={setPoolsSubTab}
          />
        ) : (
          <PositionsView
            positions={positions}
            isRefreshing={isRefreshing}
            onRefresh={handleManualRefresh}
            onClaimFee={(pos) => {
              setSelectedPosForClaim(pos);
              setIsClaimFeeOpen(true);
            }}
            onAddLiquidity={(pos) => {
              const p = pools.find(pool => pool.id === pos.poolId) || pools[0];
              handleAddLiquidityPool(p);
            }}
            onDecreaseLiquidity={(pos) => {
              setSelectedPosForDecrease(pos);
              setIsDecreaseOpen(true);
            }}
            onCreatePool={() => setIsCreatePoolOpen(true)}
            activeSubTab={poolsSubTab}
            onChangeSubTab={setPoolsSubTab}
          />
        )}
      </main>

      {/* Footer shortcut helper pill */}
      <footer className="py-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>ARCADE · Uniswap v3 & v4 on Arc Mainnet (Chain 5042)</span>
            <span>·</span>
            <span>Gas: USDC (6 desimal)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSupportOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-medium transition-colors cursor-pointer"
              title="Support this project"
            >
              <Coffee className="w-3.5 h-3.5 text-rose-500" />
              <span>☕ Support</span>
            </button>

            <button
              onClick={() => setIsShortcutsHelpOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5 text-rose-500" />
              <span>Shortcuts (?)</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreatePoolModal
        isOpen={isCreatePoolOpen}
        onClose={() => setIsCreatePoolOpen(false)}
        onCreated={handleCreatedPool}
      />

      <AddLiquidityModal
        pool={selectedPoolForAdd}
        isOpen={isAddLiquidityOpen}
        onClose={() => setIsAddLiquidityOpen(false)}
        onAdded={handleAddedPosition}
      />

      <DecreaseLiquidityModal
        position={selectedPosForDecrease}
        isOpen={isDecreaseOpen}
        onClose={() => setIsDecreaseOpen(false)}
        onDecreased={handleDecreasedLiquidity}
      />

      <ClaimFeeModal
        position={selectedPosForClaim}
        isOpen={isClaimFeeOpen}
        onClose={() => setIsClaimFeeOpen(false)}
        onClaimed={handleClaimedFee}
      />

      <TokenSelectModal
        isOpen={isTokenSelectOpen}
        onClose={() => setIsTokenSelectOpen(false)}
        onSelectToken={(token) => {
          if (tokenSelectTarget === 'in') {
            setTokenIn(token);
          } else {
            setTokenOut(token);
          }
        }}
        selectedToken={tokenSelectTarget === 'in' ? tokenIn : tokenOut}
      />

      <OmniSearchModal
        isOpen={isOmniSearchOpen}
        onClose={() => setIsOmniSearchOpen(false)}
        pools={pools}
        onSelectPool={handleAddLiquidityPool}
        onSelectToken={(token) => {
          setTokenIn(token);
          setActiveTab('swap');
        }}
        onNavigate={(tab) => setActiveTab(tab)}
        onCreatePool={() => setIsCreatePoolOpen(true)}
      />

      <ShortcutsModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />

      <FeatureStatusModal
        isOpen={isFeatureStatusOpen}
        onClose={() => setIsFeatureStatusOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
export default App;
