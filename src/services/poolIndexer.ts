import { Pool, Position, SnapshotMeta } from '../types';
import { REAL_ARC_POOLS } from '../data/realPools';

const POOLS_CACHE_KEY = 'arcade_real_pools_v6';
const SNAPSHOT_CACHE_KEY = 'arcade_snapshot_cache_v3';
const POSITIONS_CACHE_KEY = 'arcade_user_positions_v3';

export const SEED_POSITIONS: Position[] = [
  {
    id: 'pos-10492',
    poolId: '0x6A3bAcAa6493734c1Ac221EBF42CF530A96C1e02',
    version: 'v3',
    token0: {
      address: '0x3600000000000000000000000000000000000000',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
    },
    token1: {
      address: '0xeCe5cA8bf9220718E5727754026757512212cb3c',
      name: 'Argus',
      symbol: 'ARGUS',
      decimals: 18,
    },
    feeTier: 10000,
    feeDisplay: '1%',
    status: 'in-range',
    minPrice: 0.015,
    maxPrice: 0.025,
    currentPrice: 0.0195,
    token0Amount: 2500.00,
    token0ValueUsd: 2500.00,
    token1Amount: 137692.00,
    token1ValueUsd: 2685.00,
    totalValueUsd: 5185.00,
    investedValueUsd: 4600.00,
    pnlUsd: 585.00,
    pnlPercent: 12.72,
    createdAtTimestamp: Date.now() - 14 * 24 * 3600 * 1000,
    createdAtBlock: 21080000,
    ageDisplay: '14 hari lalu',
    aprEarned: 89.5,
    unclaimedFee0: 68.50,
    unclaimedFee1: 3512.00,
    unclaimedFeeUsd: 137.00,
    liquidity: '4928174928472',
    tickLower: -84000,
    tickUpper: -76000,
  },
  {
    id: 'pos-10493',
    poolId: '0x54d5fe8ee7a9546ce74ebe06c1d040defb7757410a627d4793d62a77eaaae4bf',
    version: 'v4',
    token0: {
      address: '0x3600000000000000000000000000000000000000',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
    },
    token1: {
      address: '0x8E98A62a995A50eca9979bfa016f91bf36A8F9D9',
      name: 'UpSideDownCat',
      symbol: 'USDC',
      decimals: 6,
    },
    feeTier: 500,
    feeDisplay: '0.05%',
    status: 'in-range',
    minPrice: 0.002,
    maxPrice: 0.0035,
    currentPrice: 0.00268,
    token0Amount: 1000.00,
    token0ValueUsd: 1000.00,
    token1Amount: 386716.00,
    token1ValueUsd: 1036.40,
    totalValueUsd: 2036.40,
    investedValueUsd: 1900.00,
    pnlUsd: 136.40,
    pnlPercent: 7.18,
    createdAtTimestamp: Date.now() - 10 * 3600 * 1000,
    createdAtBlock: 21241000,
    ageDisplay: '10 jam lalu',
    aprEarned: 145.2,
    unclaimedFee0: 18.20,
    unclaimedFee1: 6780.00,
    unclaimedFeeUsd: 36.40,
    liquidity: '284719284719',
    tickLower: -110000,
    tickUpper: -95000,
  },
  {
    id: 'pos-10494',
    poolId: 'duke-usdc-v4',
    version: 'v4',
    token0: {
      address: '0x3600000000000000000000000000000000000000',
      name: 'USDC',
      symbol: 'USDC',
      decimals: 6,
      logoUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
    },
    token1: {
      address: '0x7129571938561947291857193857193857193857',
      name: 'The Duke of Arc',
      symbol: 'DUKE',
      decimals: 18,
    },
    feeTier: 10000,
    feeDisplay: '1%',
    status: 'in-range',
    minPrice: 0.002,
    maxPrice: 0.0032,
    currentPrice: 0.00251,
    token0Amount: 500.00,
    token0ValueUsd: 500.00,
    token1Amount: 256095.00,
    token1ValueUsd: 642.80,
    totalValueUsd: 1142.80,
    investedValueUsd: 1000.00,
    pnlUsd: 142.80,
    pnlPercent: 14.28,
    createdAtTimestamp: Date.now() - 8 * 3600 * 1000,
    createdAtBlock: 21243500,
    ageDisplay: '8 jam lalu',
    aprEarned: 210.5,
    unclaimedFee0: 24.50,
    unclaimedFee1: 9540.00,
    unclaimedFeeUsd: 48.80,
    liquidity: '184918294719',
    tickLower: -120000,
    tickUpper: -105000,
  }
];

export class PoolIndexerService {
  /**
   * Get cached real pools (142 real pools from Arc Mainnet)
   */
  static getCachedPools(): Pool[] {
    try {
      const stored = localStorage.getItem(POOLS_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= REAL_ARC_POOLS.length) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    this.setCachedPools(REAL_ARC_POOLS);
    return REAL_ARC_POOLS;
  }

  /**
   * Save pools to client cache
   */
  static setCachedPools(pools: Pool[]): void {
    try {
      localStorage.setItem(POOLS_CACHE_KEY, JSON.stringify(pools));
    } catch {
      // ignore
    }
  }

  /**
   * Fetch live pools from DexScreener API for Arc chain
   */
  static async fetchLiveDexScreenerPools(): Promise<Pool[]> {
    try {
      const keywords = ['USDC', 'ARGUS', 'ETH', 'BTC', 'ARC', 'USD', 'POOL', 'WARP', 'LONG'];
      const uniquePairs = new Map<string, any>();

      for (const q of keywords) {
        try {
          const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (data && Array.isArray(data.pairs)) {
            for (const p of data.pairs) {
              if (p.chainId === 'arc' && p.dexId === 'uniswap') {
                uniquePairs.set(p.pairAddress.toLowerCase(), p);
              }
            }
          }
        } catch {
          // ignore single query failure
        }
      }

      if (uniquePairs.size > 0) {
        const currentPools = this.getCachedPools();
        const updatedPools = currentPools.map(pool => {
          const live = uniquePairs.get(pool.id.toLowerCase());
          if (live) {
            return {
              ...pool,
              liquidityUsd: live.liquidity?.usd || pool.liquidityUsd,
              volume24hUsd: live.volume?.h24 || pool.volume24hUsd,
              swapCount24h: ((live.txns?.h24?.buys || 0) + (live.txns?.h24?.sells || 0)) || pool.swapCount24h,
              priceUsd: parseFloat(live.priceUsd || '0') || pool.priceUsd,
              priceChange24h: live.priceChange?.h24 || pool.priceChange24h,
            };
          }
          return pool;
        });

        this.setCachedPools(updatedPools);
        return updatedPools;
      }
    } catch (err) {
      console.warn('Live DexScreener fetch fallback:', err);
    }
    return this.getCachedPools();
  }

  /**
   * Get cached snapshot metadata
   */
  static getSnapshotMeta(): SnapshotMeta {
    try {
      const stored = localStorage.getItem(SNAPSHOT_CACHE_KEY);
      if (stored) {
        const meta = JSON.parse(stored);
        const minutes = Math.floor((Date.now() - meta.timestamp) / 60000);
        return {
          ...meta,
          timeAgoMinutes: minutes,
          isStale: minutes > 15,
        };
      }
    } catch {
      // ignore
    }
    return {
      blockNumber: 21245200,
      timestamp: Date.now() - 3 * 60000,
      isStale: false,
      timeAgoMinutes: 3,
    };
  }

  /**
   * Update snapshot metadata
   */
  static setSnapshotMeta(blockNumber: number): SnapshotMeta {
    const meta: SnapshotMeta = {
      blockNumber,
      timestamp: Date.now(),
      isStale: false,
      timeAgoMinutes: 0,
    };
    try {
      localStorage.setItem(SNAPSHOT_CACHE_KEY, JSON.stringify(meta));
    } catch {
      // ignore
    }
    return meta;
  }

  /**
   * Fetch live block number directly from Arc RPC
   */
  static async fetchLiveBlockNumber(): Promise<number> {
    try {
      const res = await fetch('https://rpc.mainnet.arc.io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: Date.now(),
        }),
      });
      const json = await res.json();
      if (json.result) {
        return parseInt(json.result, 16);
      }
    } catch (e) {
      console.warn('RPC block query failed, using fallback:', e);
    }
    return 21245200;
  }

  /**
   * Get user positions
   */
  static getUserPositions(): Position[] {
    try {
      const stored = localStorage.getItem(POSITIONS_CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return SEED_POSITIONS;
  }

  /**
   * Save user positions
   */
  static saveUserPositions(positions: Position[]): void {
    try {
      localStorage.setItem(POSITIONS_CACHE_KEY, JSON.stringify(positions));
    } catch {
      // ignore
    }
  }

  /**
   * Claim fee on a position
   */
  static claimPositionFee(positionId: string): { claimed0: number; claimed1: number; claimedUsd: number } {
    const positions = this.getUserPositions();
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return { claimed0: 0, claimed1: 0, claimedUsd: 0 };

    const claimed0 = pos.unclaimedFee0;
    const claimed1 = pos.unclaimedFee1;
    const claimedUsd = pos.unclaimedFeeUsd;

    pos.unclaimedFee0 = 0;
    pos.unclaimedFee1 = 0;
    pos.unclaimedFeeUsd = 0;

    this.saveUserPositions(positions);
    return { claimed0, claimed1, claimedUsd };
  }

  /**
   * Add new created pool
   */
  static addPool(newPool: Pool): void {
    const current = this.getCachedPools();
    const updated = [newPool, ...current.filter(p => p.id !== newPool.id)];
    this.setCachedPools(updated);
  }

  /**
   * Add new position
   */
  static addPosition(newPos: Position): void {
    const current = this.getUserPositions();
    const updated = [newPos, ...current];
    this.saveUserPositions(updated);
  }

  /**
   * Decrease / Remove liquidity from position
   */
  static decreaseLiquidity(positionId: string, percentage: number): void {
    const positions = this.getUserPositions();
    const pos = positions.find(p => p.id === positionId);
    if (!pos) return;

    if (percentage >= 100) {
      pos.status = 'closed';
      pos.token0Amount = 0;
      pos.token0ValueUsd = 0;
      pos.token1Amount = 0;
      pos.token1ValueUsd = 0;
      pos.totalValueUsd = 0;
    } else {
      const factor = (100 - percentage) / 100;
      pos.token0Amount *= factor;
      pos.token0ValueUsd *= factor;
      pos.token1Amount *= factor;
      pos.token1ValueUsd *= factor;
      pos.totalValueUsd = pos.token0ValueUsd + pos.token1ValueUsd;
    }

    this.saveUserPositions(positions);
  }
}
