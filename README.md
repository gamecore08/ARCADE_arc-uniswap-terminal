# 🦄 Arcade · Uniswap v3 & v4 on Arc Mainnet (Chain 5042)

<div align="center">

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Arc Mainnet](https://img.shields.io/badge/Arc_Mainnet-Chain_5042-0052FF?style=for-the-badge&logo=ethereum&logoColor=white)](https://arc-scan.org)
[![Gas Token](https://img.shields.io/badge/Native_Gas-USDC_(6_Decimals)-2775CA?style=for-the-badge&logo=usd-coin&logoColor=white)](https://www.circle.com/usdc)

**A high-performance, responsive decentralized exchange (DEX) interface built for Uniswap v3 & v4 on Arc Mainnet (Circle L1).**

[English](README.md) · [Bahasa Indonesia](README_ID.md)

</div>

---

## 📖 Overview

**Arcade** is an advanced Uniswap v3 & v4 interface specially engineered for **Arc Mainnet (Chain ID: `5042`)**. Unlike standard EVM networks where native gas is 18-decimal ETH, Arc Mainnet utilizes **USDC with 6 decimals** as its native gas currency. 

Arcade delivers a frictionless DeFi experience featuring real-time pool discovery, concentrated liquidity provision, seamless token swaps, full position lifecycle management, omni-search navigation, and pro keyboard shortcuts.

---

## 📸 Interface Screenshots & Visual Guide

### 1. Pools Explore View
*Real-time discovery of Uniswap v3 and v4 liquidity pools with TVL, 24h Volume, APR, and fee tiers.*
![Pools Explore View](./docs/images/pools_explore.png)

---

### 2. Token Swap Engine
*Clean, lightning-fast swap interface with auto-slippage calculations and token pair flipping.*
![Swap Interface](./docs/images/swap_interface.png)

---

### 3. Concentrated Liquidity Modal (Uniswap v3 Range Picker)
*Customizable tick ranges, Full Range toggle, live deposit ratios, and 0.01% - 1% fee tier presets.*
![Add Liquidity Modal](./docs/images/add_liquidity.png)

---

### 4. Liquidity Positions Dashboard
*Track NFT-based concentrated liquidity positions, accrued uncollected fees, and 1-click harvest.*
![My Positions Dashboard](./docs/images/my_positions.png)

---

### 5. Omni-Search (`/`)
*Instant global search across all pools, token tickers, contracts, and view transitions.*
![Omni Search Modal](./docs/images/omni_search.png)

---

### 6. Pro Keyboard Shortcuts Modal (`?`)
*Power-user navigation to switch tabs, trigger refresh, open modals, or search in milliseconds.*
![Keyboard Shortcuts Modal](./docs/images/shortcuts_modal.png)

---

### 7. Feature Status & Development Roadmap Modal
*Transparent ecosystem dashboard showing production-ready features vs. modules under active development.*
![Feature Status Modal](./docs/images/feature_status.png)

---

## 🚧 Feature Status: Live vs. Under Development

To ensure complete clarity for traders and liquidity providers on Arc Mainnet, Arcade explicitly categorizes features into two statuses:

| Feature / Module | Status | Description |
| :--- | :---: | :--- |
| **Direct v3 & v4 Token Swaps** | 🟢 **Mainnet Live** | Instant swaps with native USDC gas (6 decimals) across all verified pools with slippage protection. |
| **Concentrated Liquidity (v3)** | 🟢 **Mainnet Live** | Custom price ranges, Full Range, tick presets, deposit ratios, and NFT position management. |
| **Real-time Pools Discovery** | 🟢 **Mainnet Live** | Explore 197+ verified Arc Mainnet pools with TVL, 24h volume, APR, and Degen fee tracker. |
| **Bilingual Web App (EN / ID)** | 🟢 **Mainnet Live** | Full English & Bahasa Indonesia localization toggleable directly from the navigation bar. |
| **Omni-Search & Hotkeys** | 🟢 **Mainnet Live** | Instant `/` global search and power keyboard shortcuts (`S`, `P`, `M`, `C`, `R`, `?`, `Esc`). |
| **Light & Dark Mode** | 🟢 **Mainnet Live** | Crisp Light mode and sleek Dark mode with automatic theme persistence. |
| **Uniswap v4 Dynamic Hooks** | 🟡 **Under Development** | Pool creation with hook flags is operational; dynamic hook smart contract execution sandbox is in active development. |
| **In-App Canonical Fast Bridge** | 🟡 **Under Development** | Currently links out to official Arc-Scan bridge; embedded in-dApp fast bridge widget is in development. |
| **Automated Limit Orders & TWAP** | 🟡 **Under Development** | Smart contract-based limit orders and TWAP order execution on Uniswap v3/v4 pools. |
| **Multi-Hop Smart Order Routing** | 🟡 **Under Development** | Direct single-hop routing is fully operational; multi-path split routing across 3+ intermediate tokens is being optimized. |
| **Subgraph Historical Analytics** | 🟡 **Under Development** | Deep candlestick charts and historical liquidity analytics dashboard. |

---

## ✨ Key Features

- **Dual-Protocol Support**: Seamlessly browse and manage both **Uniswap v3** and **Uniswap v4** pools on Arc Mainnet.
- **Bilingual Interface**: Toggle between English (`EN`) and Bahasa Indonesia (`ID`) directly from the top navigation bar.
- **Native USDC Gas Awareness**: Fully adapted for Arc's native currency (6 decimals), eliminating standard 18-decimal overflow errors.
- **Concentrated Liquidity (V3)**:
  - Custom Min/Max price tick boundaries with real-time token ratio calculations.
  - Quick-select buttons: **Full Range**, **±5%**, **±10%**, **±20%**.
  - Tier selection: `0.01%`, `0.05%`, `0.30%`, `1.00%`.
- **Position Lifecycle Management**:
  - Increase liquidity in existing pools.
  - Decrease liquidity with granular percentage sliders (`25%`, `50%`, `75%`, `100%`).
  - Harvest accrued trading fees without closing the position.
- **Live Arc Mainnet Snapshot**: Ships with pre-indexed verified pools (`public/arc_real_pools.json`) including ARGUS/USDC, WETH/USDC, WBTC/USDC, and community tokens.
- **Omni-Search & Command Bar**: Press `/` anywhere to search pools by token name, ticker, or pool address.
- **Pro Keyboard Shortcuts**: Full hotkey support for power traders (`S` for Swap, `P` for Pools, `N` for New Pool, `R` for Refresh, `?` for Help).
- **Dark & Light Mode**: Premium aesthetic with automatic theme persistence (all screenshots captured in Light Mode).

---

## 🌐 Arc Mainnet Network & Contract Details

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Arc Mainnet (Circle L1) |
| **Chain ID** | `5042` (`0x13b2`) |
| **Native Currency** | **USDC** (6 Decimals) |
| **RPC Endpoint** | `https://rpc.mainnet.arc.io` |
| **Block Explorer** | [https://arc-scan.org](https://arc-scan.org) / [https://explorer.arc.io](https://explorer.arc.io) |

### Official Uniswap Deployments on Arc Mainnet

| Contract | Address |
| :--- | :--- |
| **V4 PoolManager** | `0x8366a39CC670B4001A1121B8F6A443A643e40951` |
| **V4 PositionManager** | `0x6049c9a0e26405C0985f9E3685C87d0aE917f82B` |
| **V4 PositionDescriptor** | `0x516b8a945700D6bBfDeDaa6dcFc4586bA60B8707` |
| **V4 Quoter** | `0x8Dc178eFB8111BB0973Dd9d722ebeFF267c98F94` |
| **V4 StateView** | `0xF3334192D15450CdD385c8B70e03f9A6bD9E673b` |
| **V3 Factory** | `0xf0db7b58379503491d857dB50AC9ece64c653918` |
| **V3 NonfungiblePositionManager** | `0x39654A85A4C05127f5Fd6ED22CAeC077A0fB1377` |
| **V3 QuoterV2** | `0x7DfD4F31be6814D2906BDE155c3e1B146EAc1468` |
| **V3 SwapRouter02** | `0x53BF6B0684Ec7eF91e1387Da3D1a1769bC5A6F77` |
| **UniversalRouter** | `0x4fcA4a51Ab4F23A7447b3284fBd7D73289A89Fb1` |
| **Permit2** | `0x000000000022D473030F116dDEE9F6B43aC78BA3` |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| `/` | Open Omni-Search dialog |
| `S` | Switch to Swap tab |
| `P` | Switch to Pools Explore tab |
| `L` | Switch to My Positions tab |
| `N` | Open Create New Pool modal |
| `R` | Trigger manual pool & position refresh |
| `?` | Toggle Keyboard Shortcuts help modal |
| `Esc` | Close any active modal dialog |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) version 18.0 or higher
- [npm](https://www.npmjs.com/) (or pnpm / yarn)
- Web3 browser wallet (e.g. MetaMask, Rabby, Coinbase Wallet) configured for Arc Mainnet

### 1. Clone & Install
```bash
git clone https://github.com/your-username/arcade-uniswap-arc.git
cd arcade-uniswap-arc
npm install
```

### 2. Environment Configuration (Optional)
Copy the environment template if you want to override default RPC or contract endpoints:
```bash
cp .env.example .env
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Project Structure

```
arcade-uniswap-arc/
├── docs/
│   └── images/                 # High-resolution UI screenshots for documentation
│       ├── pools_explore.png
│       ├── swap_interface.png
│       ├── my_positions.png
│       ├── add_liquidity.png
│       ├── omni_search.png
│       └── shortcuts_modal.png
├── public/
│   └── arc_real_pools.json     # Pre-indexed snapshot of real Arc Mainnet pools
├── scripts/
│   ├── fetch_real_arc_pools.js # Syncs on-chain pool metrics from RPC & Uniswap Gateway
│   ├── verify_factories.js     # Validates contract bytecode on Arc Mainnet
│   └── README.md               # Documentation for automated tooling scripts
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation, theme toggle, wallet status, omni search trigger
│   │   ├── modals/             # Token selection, Omni-Search, Shortcuts dialogs
│   │   ├── pools/              # Pools explorer table, pool statistics, filter pills
│   │   ├── positions/          # Position cards, Add/Decrease/Claim modals, Create Pool
│   │   └── swap/               # Swap view, token inputs, route & slippage preview
│   ├── config/
│   │   ├── abis.ts             # ERC-20, V3 Factory, NFPM, V4 PoolManager ABIs
│   │   ├── chain.ts            # Arc Mainnet viem chain definition (Chain ID 5042)
│   │   ├── contracts.ts        # Official Uniswap v3 & v4 deployed addresses
│   │   └── tokens.ts           # Curated token list (USDC, WETH, WBTC, ARGUS, etc.)
│   ├── hooks/
│   │   ├── useArcData.ts       # TanStack Query hook with controlled caching
│   │   └── useShortcuts.ts     # Global hotkeys event listener
│   ├── services/
│   │   └── poolIndexer.ts      # Client-side pool & position indexing engine
│   ├── types/
│   │   └── index.ts            # Strong TypeScript definitions for AMM models
│   ├── utils/
│   │   └── formatters.ts       # Currency, tick calculation, and formatting utilities
│   ├── App.tsx                 # Main application shell and modal state manager
│   ├── index.css               # Tailwind directives and custom animation styles
│   └── main.tsx                # Application root mounting TanStack Query provider
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
