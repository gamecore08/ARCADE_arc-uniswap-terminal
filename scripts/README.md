# 🛠️ Arcade · Arc Mainnet Developer Scripts

This directory contains automated utility scripts to index pools, verify on-chain contracts, and test API endpoints on **Arc Mainnet (Chain ID 5042)**.

---

## 📜 Available Scripts

### 1. `fetch_real_arc_pools.js`
- **Purpose**: Queries Uniswap Gateway GraphQL API (`https://interface.gateway.uniswap.org/v1/graphql`) and Arc Mainnet RPC (`https://rpc.mainnet.arc.io`) to discover live Uniswap v3 & v4 pools.
- **Output**: Generates/updates `public/arc_real_pools.json` with token metadata, pool addresses, TVL, 24h volume, fee tiers, and estimated APR.
- **Run command**:
  ```bash
  npm run fetch:pools
  # or
  node scripts/fetch_real_arc_pools.js
  ```

---

### 2. `verify_factories.js`
- **Purpose**: Checks the Arc Mainnet RPC node to verify that all deployed contract addresses (V4 PoolManager, V4 PositionManager, V3 Factory, V3 NFPM, QuoterV2, SwapRouter02) contain valid deployed bytecode (>48,000 bytes) on-chain.
- **Run command**:
  ```bash
  npm run verify:factories
  # or
  node scripts/verify_factories.js
  ```

---

### 3. `dexscreener_sweep.js`
- **Purpose**: Sweeps DexScreener search endpoints for any pairs registered with `chainId: 'arc'` and `dexId: 'uniswap'`.
- **Run command**:
  ```bash
  node scripts/dexscreener_sweep.js
  ```

---

### 4. `test_uniswap_api.mjs`
- **Purpose**: Diagnoses Uniswap routing gateway responses, headers, and CORS compatibility for Arc Mainnet requests.
- **Run command**:
  ```bash
  node scripts/test_uniswap_api.mjs
  ```
