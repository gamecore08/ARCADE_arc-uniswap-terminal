import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'id';

interface Translations {
  // Navigation
  navTrade: string;
  navPool: string;
  navBridge: string;
  navDocs: string;
  navExplore: string;
  navSearchPlaceholder: string;
  navShortcutsGuide: string;
  navConnectWallet: string;
  navConnecting: string;
  navSwitchToArc: string;
  navDevBadge: string;
  
  // Status & Roadmap
  statusTitle: string;
  statusBadgeDev: string;
  statusBadgeLive: string;
  statusV4HooksDesc: string;
  statusBridgeDesc: string;
  statusLimitOrdersDesc: string;
  statusSorDesc: string;
  statusSubgraphDesc: string;
  close: string;
  
  // Swap View
  swapTitle: string;
  swapSubtitle: string;
  swapVersionBadge: string;
  swapYouPay: string;
  swapYouReceive: string;
  swapBalance: string;
  swapEnterAmount: string;
  swapButton: string;
  swapProcessing: string;
  swapConnectWallet: string;
  swapSwitchNetwork: string;
  swapSlippage: string;
  swapPriceImpact: string;
  swapMinReceived: string;
  swapNetworkFee: string;
  swapRate: string;
  swapRoute: string;
  swapRouteDesc: string;
  swapDevNotice: string;

  // Pools View
  poolsTitle: string;
  poolsSubtitle: string;
  poolsTabExplore: string;
  poolsTabPositions: string;
  poolsSearchPlaceholder: string;
  poolsFilterAll: string;
  poolsFilterV3: string;
  poolsFilterV4: string;
  poolsCreatePoolBtn: string;
  poolsRefreshBtn: string;
  poolsVerifiedOnly: string;
  poolsTablePool: string;
  poolsTableProtocol: string;
  poolsTableFee: string;
  poolsTableTVL: string;
  poolsTableVol: string;
  poolsTableAPR: string;
  poolsTableActions: string;
  poolsAddLiquidity: string;
  poolsTrade: string;
  poolsFeatureStatusBtn: string;
  
  // Positions View
  positionsTitle: string;
  positionsSubtitle: string;
  positionsActive: string;
  positionsClosed: string;
  positionsNewBtn: string;
  positionsNoActive: string;
  positionsInRange: string;
  positionsOutOfRange: string;
  positionsUnclaimedFees: string;
  positionsHarvest: string;
  positionsDecrease: string;
  positionsCurrentPrice: string;
  positionsMinPrice: string;
  positionsMaxPrice: string;
  
  // Modals
  modalAddLiquidityTitle: string;
  modalAddLiquiditySub: string;
  modalFullRange: string;
  modalDepositAmounts: string;
  modalConfirmAdd: string;
  modalShortcutsTitle: string;
  modalOmniSearchTitle: string;
  modalOmniSearchPlaceholder: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    navTrade: 'Trade',
    navPool: 'Pool',
    navBridge: 'Bridge',
    navDocs: 'Docs',
    navExplore: 'Explore',
    navSearchPlaceholder: 'Search token, pool, or hook...',
    navShortcutsGuide: 'Shortcuts Guide',
    navConnectWallet: 'Connect wallet',
    navConnecting: 'Connecting...',
    navSwitchToArc: 'Switch to Arc 5042',
    navDevBadge: 'In Dev',

    // Status & Roadmap
    statusTitle: 'Arcade Ecosystem Development Status',
    statusBadgeDev: 'Under Development',
    statusBadgeLive: 'Mainnet Live',
    statusV4HooksDesc: 'Uniswap v4 dynamic hook execution sandbox is under active development. Direct factory & pool creation is operational.',
    statusBridgeDesc: 'Arc Native USDC canonical bridge links to official Arc-Scan bridge. In-app fast bridge widget is in development.',
    statusLimitOrdersDesc: 'On-chain decentralized limit orders and TWAP order execution is currently in development.',
    statusSorDesc: 'Direct v3/v4 single-hop swaps are live on Arc Mainnet. Multi-hop Smart Order Routing (SOR) is under development.',
    statusSubgraphDesc: 'Real-time hybrid RPC & on-chain indexer active. Dedicated subgraph historical charting is in development.',
    close: 'Close',

    // Swap View
    swapTitle: 'Swap',
    swapSubtitle: 'Instant token swaps on Arc Mainnet (Chain 5042)',
    swapVersionBadge: 'v4 Singleton',
    swapYouPay: 'You pay',
    swapYouReceive: 'You receive',
    swapBalance: 'Balance',
    swapEnterAmount: 'Enter an amount',
    swapButton: 'Swap',
    swapProcessing: 'Swapping...',
    swapConnectWallet: 'Connect Wallet',
    swapSwitchNetwork: 'Switch to Arc 5042',
    swapSlippage: 'Max Slippage',
    swapPriceImpact: 'Price Impact',
    swapMinReceived: 'Minimum Received',
    swapNetworkFee: 'Network Fee (Arc USDC)',
    swapRate: 'Rate',
    swapRoute: 'Order Routing',
    swapRouteDesc: 'Direct Uniswap v3/v4 Arc Engine (Multi-hop routing in dev)',
    swapDevNotice: 'Multi-hop Smart Order Routing & Limit Orders are currently under active development.',

    // Pools View
    poolsTitle: 'Explore Pools',
    poolsSubtitle: 'Real-time liquidity pools on Arc Mainnet (Chain 5042) with native USDC gas',
    poolsTabExplore: 'Explore Pools',
    poolsTabPositions: 'My Positions',
    poolsSearchPlaceholder: 'Search pools by pair, token, hook or address...',
    poolsFilterAll: 'All Protocols',
    poolsFilterV3: 'Uniswap v3',
    poolsFilterV4: 'Uniswap v4',
    poolsCreatePoolBtn: '+ Create Pool',
    poolsRefreshBtn: 'Refresh',
    poolsVerifiedOnly: 'Verified Pools Only',
    poolsTablePool: 'Pool',
    poolsTableProtocol: 'Protocol',
    poolsTableFee: 'Fee Tier',
    poolsTableTVL: 'TVL',
    poolsTableVol: '24h Volume',
    poolsTableAPR: 'Est. APR',
    poolsTableActions: 'Actions',
    poolsAddLiquidity: 'Add Liquidity',
    poolsTrade: 'Trade',
    poolsFeatureStatusBtn: 'Feature Status',

    // Positions View
    positionsTitle: 'My Liquidity Positions',
    positionsSubtitle: 'Manage your concentrated liquidity positions and harvest accrued trading fees',
    positionsActive: 'Active Positions',
    positionsClosed: 'Closed Positions',
    positionsNewBtn: '+ New Position',
    positionsNoActive: 'No active liquidity positions found on Arc Mainnet.',
    positionsInRange: 'In Range',
    positionsOutOfRange: 'Out of Range',
    positionsUnclaimedFees: 'Unclaimed Fees',
    positionsHarvest: 'Harvest Fees',
    positionsDecrease: 'Decrease Liquidity',
    positionsCurrentPrice: 'Current Price',
    positionsMinPrice: 'Min Price',
    positionsMaxPrice: 'Max Price',

    // Modals
    modalAddLiquidityTitle: 'Add Concentrated Liquidity',
    modalAddLiquiditySub: 'Provide liquidity to earn transaction fees within your selected price range',
    modalFullRange: 'Full Range',
    modalDepositAmounts: 'Deposit Amounts',
    modalConfirmAdd: 'Add Liquidity',
    modalShortcutsTitle: 'Pro Keyboard Shortcuts',
    modalOmniSearchTitle: 'Omni-Search',
    modalOmniSearchPlaceholder: 'Search tokens, pools, hooks, or quick actions...',
  },
  id: {
    // Navigation
    navTrade: 'Tukar (Swap)',
    navPool: 'Likuiditas Pool',
    navBridge: 'Bridge',
    navDocs: 'Dokumentasi',
    navExplore: 'Penjelajah',
    navSearchPlaceholder: 'Cari token, pool, atau hook...',
    navShortcutsGuide: 'Panduan Shortcut',
    navConnectWallet: 'Hubungkan Dompet',
    navConnecting: 'Menghubungkan...',
    navSwitchToArc: 'Ganti ke Arc 5042',
    navDevBadge: 'Dalam Dev',

    // Status & Roadmap
    statusTitle: 'Status Pengembangan Ekosistem Arcade',
    statusBadgeDev: 'Dalam Pengembangan',
    statusBadgeLive: 'Aktif di Mainnet',
    statusV4HooksDesc: 'Sandbox eksekusi dynamic hook Uniswap v4 sedang dalam tahap pengembangan aktif. Pembuatan factory & pool langsung telah beroperasi.',
    statusBridgeDesc: 'Bridge kanonikal USDC Arc mengarah ke bridge resmi Arc-Scan. Widget fast-bridge bawaan sedang dikembangkan.',
    statusLimitOrdersDesc: 'Limit order terdesentralisasi on-chain dan eksekusi pesanan TWAP saat ini sedang dalam pengembangan.',
    statusSorDesc: 'Swap langsung single-hop v3/v4 telah aktif di Arc Mainnet. Multi-hop Smart Order Routing (SOR) sedang dalam tahap pengembangan.',
    statusSubgraphDesc: 'Pengindeks on-chain & RPC hybrid aktif. Dashboard grafik historis subgraph sedang dalam pengembangan.',
    close: 'Tutup',

    // Swap View
    swapTitle: 'Tukar Token',
    swapSubtitle: 'Swap token instan di Arc Mainnet (Chain 5042)',
    swapVersionBadge: 'v4 Singleton',
    swapYouPay: 'Anda bayar',
    swapYouReceive: 'Anda terima',
    swapBalance: 'Saldo',
    swapEnterAmount: 'Masukkan jumlah',
    swapButton: 'Tukar Sekarang',
    swapProcessing: 'Memproses Swap...',
    swapConnectWallet: 'Hubungkan Dompet',
    swapSwitchNetwork: 'Ganti ke Arc 5042',
    swapSlippage: 'Toleransi Slippage',
    swapPriceImpact: 'Dampak Harga',
    swapMinReceived: 'Minimal Diterima',
    swapNetworkFee: 'Biaya Jaringan (Arc USDC)',
    swapRate: 'Kurs',
    swapRoute: 'Rute Pesanan',
    swapRouteDesc: 'Engine Uniswap v3/v4 Arc Langsung (Multi-hop dalam pengembangan)',
    swapDevNotice: 'Multi-hop Smart Order Routing & Limit Orders saat ini sedang dalam tahap pengembangan aktif.',

    // Pools View
    poolsTitle: 'Eksplorasi Pool',
    poolsSubtitle: 'Pool likuiditas real-time di Arc Mainnet (Chain 5042) dengan gas native USDC',
    poolsTabExplore: 'Daftar Pool',
    poolsTabPositions: 'Posisi Saya',
    poolsSearchPlaceholder: 'Cari pool berdasarkan pair, token, hook atau address...',
    poolsFilterAll: 'Semua Protokol',
    poolsFilterV3: 'Uniswap v3',
    poolsFilterV4: 'Uniswap v4',
    poolsCreatePoolBtn: '+ Buat Pool Baru',
    poolsRefreshBtn: 'Segarkan',
    poolsVerifiedOnly: 'Hanya Pool Terverifikasi',
    poolsTablePool: 'Pool',
    poolsTableProtocol: 'Protokol',
    poolsTableFee: 'Biaya Pool',
    poolsTableTVL: 'TVL',
    poolsTableVol: 'Volume 24j',
    poolsTableAPR: 'Est. APR',
    poolsTableActions: 'Aksi',
    poolsAddLiquidity: 'Tambah Likuiditas',
    poolsTrade: 'Tukar (Trade)',
    poolsFeatureStatusBtn: 'Status Fitur',

    // Positions View
    positionsTitle: 'Posisi Likuiditas Saya',
    positionsSubtitle: 'Kelola posisi likuiditas terkonsentrasi Anda dan klaim fee transaksi yang terkumpul',
    positionsActive: 'Posisi Aktif',
    positionsClosed: 'Posisi Ditutup',
    positionsNewBtn: '+ Tambah Posisi Baru',
    positionsNoActive: 'Belum ada posisi likuiditas aktif yang ditemukan di Arc Mainnet.',
    positionsInRange: 'Dalam Rentang',
    positionsOutOfRange: 'Di Luar Rentang',
    positionsUnclaimedFees: 'Fee Belum Diklaim',
    positionsHarvest: 'Klaim Fee',
    positionsDecrease: 'Tarik Likuiditas',
    positionsCurrentPrice: 'Harga Saat Ini',
    positionsMinPrice: 'Harga Min',
    positionsMaxPrice: 'Harga Max',

    // Modals
    modalAddLiquidityTitle: 'Tambah Likuiditas Terkonsentrasi',
    modalAddLiquiditySub: 'Sediakan likuiditas untuk memperoleh bagi hasil fee dalam rentang harga yang dipilih',
    modalFullRange: 'Rentang Penuh',
    modalDepositAmounts: 'Jumlah Deposit',
    modalConfirmAdd: 'Konfirmasi Tambah Likuiditas',
    modalShortcutsTitle: 'Shortcut Keyboard Pro',
    modalOmniSearchTitle: 'Pencarian Global (Omni-Search)',
    modalOmniSearchPlaceholder: 'Cari token, pool, hook, atau aksi cepat...',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('arcade_lang');
    return (saved === 'id' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('arcade_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'id' : 'en');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
