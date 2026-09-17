import { Token } from '../types';

/**
 * Known tokens deployed on Arc Mainnet
 * Note: USDC is the native gas token on Arc with 6 decimals.
 */
export const ARC_TOKENS: Token[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'USDC',
    name: 'USD Coin (Native Gas)',
    decimals: 6,
    isNative: true,
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  },
  {
    address: '0xd2ba891a27f6f1c4e7c3e86c0b395db8d141db8d',
    symbol: 'LONG',
    name: 'Long Token',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  {
    address: '0x581b89ef726a45e4a7a726e45318182926e4726e',
    symbol: 'POUNCH',
    name: 'Pounch Ecosystem',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png',
  },
  {
    address: '0xe60c6d54625b90f18619a9a3b6188448f1863581',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
  },
  {
    address: '0x9816a7f8271a473859210134a6210f135b912389',
    symbol: 'WARP',
    name: 'Warp Protocol',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  {
    address: '0x7162b4891a527c819438101a948b91a7c5b91a7c',
    symbol: 'POLL',
    name: 'Poll Network',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png',
  },
  {
    address: '0xd817294861b527492164a6b28491a7c5dfc61234',
    symbol: 'CRCL',
    name: 'Circle Community',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  },
  {
    address: '0xc61838194819a527c819438101a948b92f561234',
    symbol: 'ELLIPSE',
    name: 'Ellipse Finance',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
  },
  {
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    decimals: 8,
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
  },
  {
    address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed',
    symbol: 'DEGEN',
    name: 'Degen Token',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/34515/small/degen.png',
  },
  {
    address: '0x532f27101965dd16442e59d40670faf5ebb142e4',
    symbol: 'MOON',
    name: 'Moon Arc',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/23114/small/moon.png',
  },
  {
    address: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    symbol: 'PEPE',
    name: 'Pepe Arc',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.png',
  },
  {
    address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
    symbol: 'ARCD',
    name: 'Arcade Native',
    decimals: 18,
    logoUrl: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
  },
  {
    address: '0xd31a59c85ae9d8edefec411d448f90841571b89c',
    symbol: 'SOL',
    name: 'Wrapped SOL',
    decimals: 9,
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
  },
];

export const NATIVE_USDC = ARC_TOKENS[0];
