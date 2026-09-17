/**
 * Official Uniswap v4 and v3 contract deployments on Arc Mainnet (Chain ID 5042)
 * 
 * Source: Official Uniswap Deployments Feed (developers.uniswap.org/deployments.json, commit 3793618)
 * and verified on Arc RPC (eth_getCode length verified > 48k bytes).
 * 
 * You can override any address via VITE_ prefixed environment variables if desired.
 */

export const ARC_CONTRACTS = {
  // Uniswap v4 Core & Periphery
  v4: {
    poolManager: (import.meta.env.VITE_V4_POOL_MANAGER || '0x8366a39CC670B4001A1121B8F6A443A643e40951') as `0x${string}`,
    positionManager: (import.meta.env.VITE_V4_POSITION_MANAGER || '0x6049c9a0e26405C0985f9E3685C87d0aE917f82B') as `0x${string}`,
    positionDescriptor: (import.meta.env.VITE_V4_POSITION_DESCRIPTOR || '0x516b8a945700D6bBfDeDaa6dcFc4586bA60B8707') as `0x${string}`,
    quoter: (import.meta.env.VITE_V4_QUOTER || '0x8Dc178eFB8111BB0973Dd9d722ebeFF267c98F94') as `0x${string}`,
    stateView: (import.meta.env.VITE_V4_STATE_VIEW || '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b') as `0x${string}`,
    reservesLens: (import.meta.env.VITE_V4_RESERVES_LENS || '0x0000001b173C3bbF3984D417d8614E3eed34865B') as `0x${string}`,
  },

  // Uniswap v3 Core & Periphery
  v3: {
    factory: (import.meta.env.VITE_V3_FACTORY || '0xf0db7b58379503491d857dB50AC9ece64c653918') as `0x${string}`,
    positionManager: (import.meta.env.VITE_V3_POSITION_MANAGER || '0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377') as `0x${string}`,
    quoterV2: (import.meta.env.VITE_V3_QUOTER_V2 || '0x7DfD4F31be6814D2906BDE155c3e1B146EAc1468') as `0x${string}`,
    swapRouter02: (import.meta.env.VITE_V3_SWAP_ROUTER_02 || '0x53BF6B0684Ec7eF91e1387Da3D1a1769bC5A6F77') as `0x${string}`,
    multicall: (import.meta.env.VITE_V3_MULTICALL || '0x33e885eD0Ec9bF04EcfB19341582aADCb4c8A9E7') as `0x${string}`,
  },

  // Common Routers & Periphery
  common: {
    universalRouter: (import.meta.env.VITE_UNIVERSAL_ROUTER || '0x4fcA4a51Ab4F23A7447b3284fBd7D73289A89Fb1') as `0x${string}`,
    permit2: (import.meta.env.VITE_PERMIT2 || '0x000000000022D473030F116dDEE9F6B43aC78BA3') as `0x${string}`,
    liquidityLauncher: (import.meta.env.VITE_LIQUIDITY_LAUNCHER || '0x0000FffFBE8efE702c8703aE3477FF5dE3d319C0') as `0x${string}`,
  },
} as const;
