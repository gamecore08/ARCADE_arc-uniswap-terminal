import { formatUnits, parseUnits } from 'viem';

/**
 * Format native gas token (USDC on Arc) strictly with 6 decimals.
 */
export function formatUsdc(amountWei: bigint | string | number): string {
  try {
    const bigintVal = typeof amountWei === 'bigint' ? amountWei : BigInt(amountWei.toString());
    const formatted = formatUnits(bigintVal, 6);
    const num = parseFloat(formatted);
    if (num < 0.0001 && num > 0) return '<0.0001';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } catch {
    return '0.00';
  }
}

/**
 * Parse USDC with 6 decimals
 */
export function parseUsdc(amountStr: string): bigint {
  try {
    return parseUnits(amountStr, 6);
  } catch {
    return 0n;
  }
}

/**
 * Format USD values like $1.3M, $25M, $82.88
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '$0.00';
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 10_000) {
    return `$${Math.round(amount).toLocaleString('en-US')}`;
  }
  if (amount >= 1) {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (amount > 0) {
    return `$${amount.toPrecision(3)}`;
  }
  return '$0.00';
}

/**
 * Format percentage like 730,741.75% or 10%
 */
export function formatPercent(val: number): string {
  if (isNaN(val)) return '0.00%';
  if (val >= 1000) {
    return `${Math.round(val).toLocaleString('en-US')}%`;
  }
  return `${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

/**
 * Format a pool fee tier display string cleanly.
 * Rounds to max 2 decimal places, e.g. "4.9888%" -> "4.99%", "3.6699%" -> "3.67%"
 * Preserves clean values like "1%", "0.3%", "0.05%"
 */
export function formatFeeDisplay(feeDisplay: string | undefined, feeTier?: number): string {
  if (!feeDisplay && feeTier == null) return '—';
  
  // Try to parse feeTier first (most accurate)
  if (feeTier != null && feeTier > 0) {
    const pct = feeTier / 10000;
    if (Number.isInteger(pct)) return `${pct}%`;
    // Round to 2 decimal places max
    const rounded = parseFloat(pct.toFixed(2));
    return rounded === Math.floor(rounded) ? `${rounded}%` : `${rounded}%`;
  }
  
  // Fall back to parsing feeDisplay string
  if (feeDisplay) {
    const num = parseFloat(feeDisplay.replace('%', ''));
    if (!isNaN(num)) {
      if (num === 0) return '0% (Dynamic)';
      const rounded = parseFloat(num.toFixed(2));
      return `${rounded}%`;
    }
    return feeDisplay;
  }
  return '—';
}

/**
 * Shorten Ethereum address (0x581b...26e4)
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Convert Uniswap v3/v4 tick to price
 * P = 1.0001^tick
 */
export function tickToPrice(tick: number, decimalsDiff = 0): number {
  return Math.pow(1.0001, tick) * Math.pow(10, decimalsDiff);
}

/**
 * Convert price to nearest Uniswap v3/v4 tick
 */
export function priceToTick(price: number, tickSpacing = 60, decimalsDiff = 0): number {
  const rawPrice = price / Math.pow(10, decimalsDiff);
  const rawTick = Math.log(rawPrice) / Math.log(1.0001);
  return Math.round(rawTick / tickSpacing) * tickSpacing;
}
