import { defineChain } from 'viem';

/**
 * Arc Mainnet configuration (Circle L1)
 * Chain ID: 5042 (0x13b2)
 * CRITICAL: Native gas token is USDC with 6 decimals (NOT 18 decimals like ETH).
 */
export const arcMainnet = defineChain({
  id: 5042,
  name: 'Arc Mainnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6, // CRITICAL: Arc native gas token is USDC (6 decimals)
  },
  rpcUrls: {
    default: {
      http: [
        'https://rpc.mainnet.arc.io',
      ],
    },
    public: {
      http: [
        'https://rpc.mainnet.arc.io',
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arcscan (independent)',
      url: 'https://arc-scan.org',
    },
    official: {
      name: 'Arc Explorer',
      url: 'https://explorer.arc.io',
    },
  },
});
