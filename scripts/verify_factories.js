import { createPublicClient, http } from 'viem';

const client = createPublicClient({ transport: http('https://rpc.mainnet.arc.io') });

const factoryAbi = [
  { inputs: [], name: 'factory', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'fee', outputs: [{ type: 'uint24' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'token0', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'token1', outputs: [{ type: 'address' }], stateMutability: 'view', type: 'function' }
];

async function main() {
  console.log('Searching DexScreener for different v3 Uniswap pools on Arc...');
  const searchQueries = ['ARGUS', 'LONG', 'ARC', 'USD', 'ETH', 'WETH'];
  const poolAddresses = new Map();

  for (const q of searchQueries) {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`);
      const data = await res.json();
      if (data.pairs) {
        for (const p of data.pairs) {
          if (p.chainId === 'arc' && p.dexId === 'uniswap' && p.labels?.includes('v3')) {
            poolAddresses.set(p.pairAddress.toLowerCase(), {
              address: p.pairAddress,
              pair: `${p.baseToken.symbol}/${p.quoteToken.symbol}`
            });
          }
        }
      }
    } catch (e) {}
  }

  console.log(`Found ${poolAddresses.size} distinct v3 pools on Arc.`);
  console.log('Now querying on-chain factory() for each pool via https://rpc.mainnet.arc.io:');

  for (const [_, item] of poolAddresses) {
    try {
      const factory = await client.readContract({
        address: item.address,
        abi: factoryAbi,
        functionName: 'factory'
      });
      const fee = await client.readContract({
        address: item.address,
        abi: factoryAbi,
        functionName: 'fee'
      });
      console.log(`Pool [${item.pair}] at ${item.address}:`);
      console.log(`  -> factory(): ${factory}`);
      console.log(`  -> fee(): ${fee} (${fee / 10000}%)`);
    } catch (err) {
      console.log(`Failed on ${item.address}:`, err.message);
    }
  }
}

main();
