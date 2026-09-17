import { Pool } from '../types';
import { formatFeeDisplay } from './formatters';

export interface PoolDegenMetrics {
  poolId: string;
  pairKey: string;
  isDegen: boolean; // Fee >= 10% (100,000 millionths)
  isUltraDegen: boolean; // Fee >= 50%
  feePercent: number;
  feeFormatted: string;
  ageMs: number;
  ageFormatted: string;
  exactDateFormatted: string;
  isFresh: boolean; // < 24h
  isRecent: boolean; // < 3 days
  hasLowerFeePool: boolean;
  lowerFeePoolCount: number;
  minFeePercentInPair: number;
  lowerPoolsCreatedBefore: number;
  lowerPoolsCreatedAfter: number;
  wasFirstInPair: boolean;
  isGoldenWindow: boolean; // Fee >= 10% AND no lower fee pool exists yet
  isDiluted: boolean; // Fee >= 10% AND lower fee pool already exists
  statusTitle: string;
  statusBadgeText: string;
  statusDescription: string;
}

export type DegenFilterType = 'all' | 'degen-all' | 'degen-golden' | 'degen-fresh';

export function getPoolPairKey(pool: Pool): string {
  // Use lowercase token addresses if available, fallback to symbol
  const addr0 = pool.token0.address ? pool.token0.address.toLowerCase() : pool.token0.symbol.toLowerCase();
  const addr1 = pool.token1.address ? pool.token1.address.toLowerCase() : pool.token1.symbol.toLowerCase();
  return [addr0, addr1].sort().join('/');
}

export function formatRelativeAge(timestampMs: number | undefined): { ageFormatted: string; exactFormatted: string } {
  if (!timestampMs || isNaN(timestampMs)) {
    return { ageFormatted: '—', exactFormatted: 'Waktu pembuatan tidak diketahui' };
  }
  const now = Date.now();
  const diff = Math.max(0, now - timestampMs);
  const exactFormatted = new Date(timestampMs).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return { ageFormatted: 'Baru saja', exactFormatted };
  if (mins < 60) return { ageFormatted: `${mins}m lalu`, exactFormatted };

  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return { ageFormatted: `${hours}j lalu`, exactFormatted };

  const days = Math.floor(hours / 24);
  return { ageFormatted: `${days} hari lalu`, exactFormatted };
}

/**
 * Pre-computes degen signals and competition metrics for all pools
 */
export function buildDegenMetricsMap(allPools: Pool[]): Map<string, PoolDegenMetrics> {
  const pairMap = new Map<string, Pool[]>();
  for (const pool of allPools) {
    const key = getPoolPairKey(pool);
    let list = pairMap.get(key);
    if (!list) {
      list = [];
      pairMap.set(key, list);
    }
    list.push(pool);
  }

  const metricsMap = new Map<string, PoolDegenMetrics>();

  for (const pool of allPools) {
    const key = getPoolPairKey(pool);
    const pairPools = pairMap.get(key) || [];
    const curFee = pool.feeTier || 0;
    const feePct = curFee / 10000;
    const isDegen = curFee >= 100000; // >= 10%
    const isUltraDegen = curFee >= 500000; // >= 50%
    const feeFormatted = formatFeeDisplay(pool.feeDisplay, pool.feeTier);

    const lowerPools = pairPools.filter((p) => (p.feeTier || 0) < curFee);
    const hasLowerFeePool = lowerPools.length > 0;
    const lowerFeePoolCount = lowerPools.length;

    const minFeeInPair = pairPools.length > 0 ? Math.min(...pairPools.map((p) => p.feeTier || 0)) : curFee;
    const minFeePercentInPair = minFeeInPair / 10000;

    const poolCreated = pool.pairCreatedAt || 0;
    const lowerPoolsCreatedBefore = lowerPools.filter(
      (p) => p.pairCreatedAt && poolCreated && p.pairCreatedAt <= poolCreated
    ).length;
    const lowerPoolsCreatedAfter = lowerPools.filter(
      (p) => p.pairCreatedAt && poolCreated && p.pairCreatedAt > poolCreated
    ).length;

    const wasFirstInPair = isDegen && lowerPoolsCreatedBefore === 0;
    const isGoldenWindow = isDegen && !hasLowerFeePool;
    const isDiluted = isDegen && hasLowerFeePool;

    const ageMs = poolCreated ? Math.max(0, Date.now() - poolCreated) : Infinity;
    const isFresh = ageMs < 24 * 3600000; // < 24 hours
    const isRecent = ageMs < 3 * 24 * 3600000; // < 3 days
    const { ageFormatted, exactFormatted } = formatRelativeAge(pool.pairCreatedAt);

    let statusTitle = 'Normal Pool';
    let statusBadgeText = '';
    let statusDescription = '';

    if (isGoldenWindow) {
      statusTitle = '🔥 Golden Window (Eksklusif)';
      statusBadgeText = '🔥 GOLDEN WINDOW';
      statusDescription = `Belum ada fee tier lebih rendah untuk pair ini. Semua swap wajib membayar fee ${feeFormatted}!`;
    } else if (isDiluted) {
      statusTitle = '⚠️ Diluted (Ada Fee Murah)';
      statusBadgeText = `⚠️ DILUTED (${lowerFeePoolCount} pool)`;
      const minFeeStr = formatFeeDisplay(undefined, minFeeInPair);
      statusDescription = `Sudah ada ${lowerFeePoolCount} pool lebih murah (terendah ${minFeeStr}). Volume kemungkinan dialihkan ke pool murah sehingga pool ini kurang laku lagi.`;
    } else if (isDegen) {
      statusTitle = '⚡ Degen Pool';
      statusBadgeText = '⚡ DEGEN';
      statusDescription = `Fee tier ${feeFormatted}`;
    }

    metricsMap.set(pool.id, {
      poolId: pool.id,
      pairKey: key,
      isDegen,
      isUltraDegen,
      feePercent: feePct,
      feeFormatted,
      ageMs,
      ageFormatted,
      exactDateFormatted: exactFormatted,
      isFresh,
      isRecent,
      hasLowerFeePool,
      lowerFeePoolCount,
      minFeePercentInPair,
      lowerPoolsCreatedBefore,
      lowerPoolsCreatedAfter,
      wasFirstInPair,
      isGoldenWindow,
      isDiluted,
      statusTitle,
      statusBadgeText,
      statusDescription,
    });
  }

  return metricsMap;
}
