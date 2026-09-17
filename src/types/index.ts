export type PoolVersion = 'all' | 'v4' | 'v3';
export type HookFilter = 'all' | 'no-hook' | 'with-hooks';
export type PoolSort = 'highest-apr' | 'liquidity' | 'volume' | 'fee' | 'newest';
export type PoolSortField = 'apr' | 'liquidity' | 'volume' | 'fee' | 'pair' | 'newest';
export type SortDirection = 'asc' | 'desc';

export interface Token {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  isNative?: boolean; // For native USDC on Arc
}

export interface HookInfo {
  address: `0x${string}`;
  name: string;
  description: string;
  type: 'dynamic-fee' | 'twamm' | 'limit-order' | 'volatility-oracle' | 'custom' | 'none';
}

export interface Pool {
  id: string; // PoolId or pair address
  version: 'v4' | 'v3';
  token0: Token;
  token1: Token;
  feeTier: number; // in hundredths of a bip, or % (e.g. 500 = 0.05%, 3000 = 0.3%, 10000 = 1%, 100000 = 10%)
  feeDisplay: string; // e.g. "10%", "20%", "50%", "0.3%"
  hook?: HookInfo;
  liquidityUsd: number;
  token0Reserve: number;
  token1Reserve: number;
  volume24hUsd: number;
  swapCount24h?: number;
  swaps24h?: number;
  estFeeApr: number; // e.g. 730741.75
  currentTick?: number;
  sqrtPriceX96?: string;
  createdAtBlock?: number;
  poolAddress?: `0x${string}`;
  priceUsd?: number;
  priceChange24h?: number;
  pairCreatedAt?: number;
  dexScreenerUrl?: string;
}

export interface Position {
  id: string; // NFT token ID or v4 position key
  poolId: string;
  version: 'v4' | 'v3';
  token0: Token;
  token1: Token;
  feeTier: number;
  feeDisplay: string;
  status: 'in-range' | 'out-of-range' | 'closed';
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  token0Amount: number;
  token0ValueUsd: number;
  token1Amount: number;
  token1ValueUsd: number;
  totalValueUsd: number;
  investedValueUsd?: number; // Capital initially deposited
  pnlUsd?: number;           // Net profit / loss in USD
  pnlPercent?: number;       // Net profit / loss percentage
  createdAtTimestamp?: number; // When position was opened
  createdAtBlock?: number;   // Block height when opened
  ageDisplay?: string;       // e.g. "14 days ago", "8 hours ago"
  aprEarned?: number;        // Position annualized fee yield
  unclaimedFee0: number;
  unclaimedFee1: number;
  unclaimedFeeUsd: number;
  liquidity: string;
  tickLower: number;
  tickUpper: number;
}

export interface SnapshotMeta {
  blockNumber: number;
  timestamp: number; // epoch ms
  isStale: boolean;
  timeAgoMinutes: number;
}
