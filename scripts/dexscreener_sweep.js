async function main() {
  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const popularKeywords = ['USDC', 'ARGUS', 'ETH', 'BTC', 'SOL', 'ARC', 'USD', 'POOL', 'WARP', 'POUNCH', 'LONG', 'AI', 'MEME', 'PEPE', 'DOGE', 'MOON', 'DEGEN', 'CRCL', 'CIRCLE', 'WETH', 'WBTC'];
  const queries = [...new Set([...popularKeywords, ...letters])];

  const allPairs = new Map();
  console.log(`Starting sweep across ${queries.length} queries on DexScreener...`);

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`);
      const data = await res.json();
      if (data.pairs) {
        let arcCount = 0;
        for (const p of data.pairs) {
          if (p.chainId === 'arc' && p.dexId === 'uniswap') {
            allPairs.set(p.pairAddress.toLowerCase(), p);
            arcCount++;
          }
        }
      }
    } catch (e) {
      console.error(`Error on query ${q}:`, e.message);
    }
    // Small delay to prevent rate limit
    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`Total unique Arc Uniswap pairs found: ${allPairs.size}`);
  
  let v3Count = 0;
  let v4Count = 0;
  let totalLiqUsd = 0;
  let totalVol24h = 0;

  for (const p of allPairs.values()) {
    if (p.labels?.includes('v4')) v4Count++;
    else if (p.labels?.includes('v3')) v3Count++;
    totalLiqUsd += p.liquidity?.usd || 0;
    totalVol24h += p.volume?.h24 || 0;
  }

  console.log(`Summary:`);
  console.log(`- Uniswap v4 pools: ${v4Count}`);
  console.log(`- Uniswap v3 pools: ${v3Count}`);
  console.log(`- Total Liquidity (USD): $${totalLiqUsd.toLocaleString()}`);
  console.log(`- Total 24h Volume (USD): $${totalVol24h.toLocaleString()}`);

  const v3Sample = Array.from(allPairs.values()).filter(p => p.labels?.includes('v3')).slice(0, 5);
  console.log('\nSample v3 pools:');
  for (const p of v3Sample) {
    console.log(`v3: ${p.baseToken.symbol}/${p.quoteToken.symbol} | Addr: ${p.pairAddress} | Liq: $${p.liquidity?.usd} | Vol: $${p.volume?.h24}`);
  }

  const v4Sample = Array.from(allPairs.values()).filter(p => p.labels?.includes('v4')).slice(0, 5);
  console.log('\nSample v4 pools:');
  for (const p of v4Sample) {
    console.log(`v4: ${p.baseToken.symbol}/${p.quoteToken.symbol} | Id: ${p.pairAddress} | Liq: $${p.liquidity?.usd} | Vol: $${p.volume?.h24}`);
  }
}

main();
