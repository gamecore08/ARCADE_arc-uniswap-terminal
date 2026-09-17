import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RPC = 'https://rpc.mainnet.arc.io';
const GW  = 'https://interface.gateway.uniswap.org/v1/graphql';
const GW_HEADERS = {
  'Content-Type': 'application/json',
  'Origin': 'https://app.uniswap.org',
  'Referer': 'https://app.uniswap.org/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

const FEE_SELECTOR = '0xddca3f43';

/**
 * Call fee() on a V3 pool contract via RPC.
 */
async function getV3FeeOnchain(poolAddress) {
  try {
    const res = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'eth_call',
        params: [{ to: poolAddress, data: FEE_SELECTOR }, 'latest']
      })
    });
    const d = await res.json();
    if (d.result && d.result !== '0x') {
      return parseInt(d.result, 16);
    }
  } catch (_) {}
  return null;
}

/**
 * Fetch V4 pool fee tier from Uniswap Gateway using poolId (hash).
 */
async function getV4FeeFromUniswap(poolId) {
  try {
    const res = await fetch(GW, {
      method: 'POST',
      headers: GW_HEADERS,
      body: JSON.stringify({
        query: `{ v4Pool(chain: ARC, poolId: "${poolId}") { feeTier } }`
      })
    });
    const d = await res.json();
    const fee = d.data?.v4Pool?.feeTier;
    if (fee != null) return fee;
  } catch (_) {}
  return null;
}

/**
 * Fetch V3 pool fee tier from Uniswap Gateway using pool address.
 */
async function getV3FeeFromUniswap(poolAddress) {
  try {
    const res = await fetch(GW, {
      method: 'POST',
      headers: GW_HEADERS,
      body: JSON.stringify({
        query: `{ v3Pool(chain: ARC, address: "${poolAddress}") { feeTier } }`
      })
    });
    const d = await res.json();
    const fee = d.data?.v3Pool?.feeTier;
    if (fee != null) return fee;
  } catch (_) {}
  return null;
}

/**
 * Format fee tier (millionths) to display string
 * e.g. 500 -> "0.05%", 3000 -> "0.3%", 10000 -> "1%", 50000 -> "5%", 49000 -> "4.9%"
 */
function formatFee(feeTier) {
  const pct = feeTier / 10000;
  // Handle common cases cleanly
  if (Number.isInteger(pct)) return `${pct}%`;
  return `${pct.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')}%`;
}

async function fetchAllArcPairs() {
  console.log('=== Arc Real Pool Fetcher (Uniswap GW + RPC fee tiers) ===\n');

  // Step 1: Fetch all pools from DexScreener
  console.log('Step 1: Fetching all pools from DexScreener...');
  const keywords = [
    'USDC', 'USDT', 'ARGUS', 'ETH', 'WETH', 'BTC', 'WBTC', 'SOL', 'ARC',
    'TOLLY', 'MINARA', 'WARP', 'POUNCH', 'LONG', 'AI', 'MEME', 'PEPE',
    'DOGE', 'MOON', 'DEGEN', 'CRCL', 'CIRCLE', 'TRUMP', 'SHIB', 'PUMP',
    'CAT', 'DOG', 'BULL', 'BEAR', 'DUKE',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  ];

  const uniquePairs = new Map();
  for (let i = 0; i < keywords.length; i++) {
    const q = keywords[i];
    try {
      const url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && Array.isArray(data.pairs)) {
        for (const p of data.pairs) {
          if (p.chainId === 'arc' && p.dexId === 'uniswap') {
            const key = p.pairAddress.toLowerCase();
            if (!uniquePairs.has(key)) uniquePairs.set(key, p);
          }
        }
      }
    } catch (err) {
      console.error(`  Error for "${q}":`, err.message);
    }
    await new Promise(r => setTimeout(r, 60));
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`  Progress: ${i + 1}/${keywords.length} keywords, ${uniquePairs.size} pools\r`);
    }
  }
  console.log(`\n  -> ${uniquePairs.size} unique Arc Uniswap pools found\n`);

  // Step 2: Fetch fee tiers for all pools
  console.log('Step 2: Fetching real fee tiers from Uniswap GW + RPC...');
  const feeTierMap = new Map();
  const allPairs = Array.from(uniquePairs.values());

  let gwHits = 0, rpcHits = 0, fallback = 0;
  
  for (let i = 0; i < allPairs.length; i++) {
    const p = allPairs[i];
    const key = p.pairAddress.toLowerCase();
    const isV4 = p.labels?.includes('v4') || p.pairAddress?.length === 66;

    let fee = null;
    let source = '';

    if (isV4) {
      // V4: query Uniswap Gateway using poolId (hash)
      fee = await getV4FeeFromUniswap(p.pairAddress);
      if (fee != null) { gwHits++; source = 'gw-v4'; }
    } else {
      // V3: try Uniswap Gateway first, then RPC fee() call
      fee = await getV3FeeFromUniswap(p.pairAddress);
      if (fee != null) { gwHits++; source = 'gw-v3'; }
      else {
        fee = await getV3FeeOnchain(p.pairAddress);
        if (fee != null) { rpcHits++; source = 'rpc'; }
      }
    }

    if (fee != null) {
      feeTierMap.set(key, { fee, source });
    } else {
      fallback++;
    }

    await new Promise(r => setTimeout(r, 50));
    if ((i + 1) % 20 === 0) {
      process.stdout.write(`  Progress: ${i + 1}/${allPairs.length} | GW:${gwHits} RPC:${rpcHits} fallback:${fallback}\r`);
    }
  }
  console.log(`\n  -> GW: ${gwHits} | RPC: ${rpcHits} | Fallback: ${fallback}\n`);

  // Step 3: Build final pool objects
  console.log('Step 3: Building pool data...');
  const pools = allPairs.map((p) => {
    const isV4 = p.labels?.includes('v4') || p.pairAddress?.length === 66;
    const version = isV4 ? 'v4' : 'v3';
    const pairKey = p.pairAddress.toLowerCase();

    // Token arrangement: prefer USDC as token0
    let token0, token1;
    const isQuoteUSDC = p.quoteToken?.symbol?.toUpperCase() === 'USDC';
    if (isQuoteUSDC) {
      token0 = {
        address: p.quoteToken.address,
        name: p.quoteToken.name,
        symbol: p.quoteToken.symbol,
        decimals: 6,
        logoUrl: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
      };
      token1 = {
        address: p.baseToken.address,
        name: p.baseToken.name,
        symbol: p.baseToken.symbol,
        decimals: p.baseToken.symbol === 'USDC' ? 6 : 18,
        logoUrl: p.info?.imageUrl || undefined,
      };
    } else {
      token0 = {
        address: p.quoteToken.address,
        name: p.quoteToken.name,
        symbol: p.quoteToken.symbol,
        decimals: p.quoteToken.symbol === 'USDC' ? 6 : 18,
        logoUrl: p.quoteToken.symbol === 'USDC'
          ? 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png'
          : undefined,
      };
      token1 = {
        address: p.baseToken.address,
        name: p.baseToken.name,
        symbol: p.baseToken.symbol,
        decimals: p.baseToken.symbol === 'USDC' ? 6 : 18,
        logoUrl: p.info?.imageUrl || undefined,
      };
    }

    const vol24h = p.volume?.h24 || 0;
    const liqUsd = p.liquidity?.usd || 0;
    const txns24h = (p.txns?.h24?.buys || 0) + (p.txns?.h24?.sells || 0);

    // Get fee tier from map
    const feeData = feeTierMap.get(pairKey);
    let feeTier = feeData?.fee;
    
    // Fallback fee tiers
    if (feeTier == null) {
      if (isV4) feeTier = 10000; // 1% V4 default
      else feeTier = 3000; // 0.3% V3 default
    }

    const feeDisplay = formatFee(feeTier);

    // Real uncapped APR
    let estFeeApr = 0;
    if (liqUsd > 10 && feeTier > 0) {
      const feeRate = feeTier / 1000000;
      const annualFees = vol24h * feeRate * 365;
      estFeeApr = parseFloat(((annualFees / liqUsd) * 100).toFixed(2));
    }

    return {
      id: p.pairAddress,
      poolAddress: p.pairAddress,
      version,
      token0,
      token1,
      feeTier,
      feeDisplay,
      liquidityUsd: liqUsd,
      token0Reserve: p.liquidity?.quote || 0,
      token1Reserve: p.liquidity?.base || 0,
      volume24hUsd: vol24h,
      swapCount24h: txns24h,
      swaps24h: txns24h,
      estFeeApr,
      priceUsd: parseFloat(p.priceUsd || '0'),
      priceChange24h: p.priceChange?.h24 || 0,
      pairCreatedAt: p.pairCreatedAt,
      dexScreenerUrl: p.url,
    };
  });

  pools.sort((a, b) => b.liquidityUsd - a.liquidityUsd);

  // Stats
  console.log('\n=== FINAL STATS ===');
  console.log(`Total Pools: ${pools.length}`);
  console.log(`V4: ${pools.filter(p => p.version === 'v4').length} | V3: ${pools.filter(p => p.version === 'v3').length}`);

  const feeGroups = {};
  for (const p of pools) {
    feeGroups[p.feeDisplay] = (feeGroups[p.feeDisplay] || 0) + 1;
  }
  console.log('\nFee Tier Breakdown:');
  Object.entries(feeGroups)
    .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    .forEach(([fee, cnt]) => console.log(`  ${fee.padStart(8)}: ${cnt} pools`));

  const highFee = pools.filter(p => p.feeTier > 10000);
  console.log(`\nHigh-fee pools (>1%): ${highFee.length}`);
  highFee.slice(0, 10).forEach(p => {
    console.log(`  ${(p.token0.symbol+'/'+p.token1.symbol).padEnd(20)} ${p.feeDisplay.padStart(6)} ${p.version} | liq=$${p.liquidityUsd.toFixed(0)} vol=$${p.volume24hUsd.toFixed(0)} APR=${p.estFeeApr.toFixed(0)}%`);
  });

  // Save
  const outDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'arc_real_pools.json');
  fs.writeFileSync(jsonPath, JSON.stringify(pools, null, 2), 'utf-8');
  console.log(`\nSaved to ${jsonPath}`);

  const tsContent = `import { Pool } from '../types';\n\nexport const REAL_ARC_POOLS: Pool[] = ${JSON.stringify(pools, null, 2)};\n`;
  const tsPath = path.resolve(__dirname, '../src/data/realPools.ts');
  fs.writeFileSync(tsPath, tsContent, 'utf-8');
  console.log(`Saved to ${tsPath}`);
}

fetchAllArcPairs();
