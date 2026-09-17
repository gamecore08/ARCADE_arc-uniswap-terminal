import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, parseUnits } from 'viem';
import { arcMainnet } from '../config/chain';
import { formatUsdc } from '../utils/formatters';

interface WalletContextType {
  address: `0x${string}` | null;
  chainId: number | null;
  isArcMainnet: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  usdcBalance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToArc: () => Promise<void>;
  sendUsdc: (to: `0x${string}`, amountUsdc: string) => Promise<`0x${string}`>;
  publicClient: any;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const publicClient = createPublicClient({
  chain: arcMainnet,
  transport: http('https://rpc.mainnet.arc.io'),
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>('0.00');

  const isArcMainnet = chainId === 5042;
  const isConnected = !!address;

  // Refresh native USDC balance (6 decimals on Arc)
  const refreshBalance = useCallback(async (addr: `0x${string}`) => {
    try {
      const balanceWei = await publicClient.getBalance({ address: addr });
      // Arc native gas token is USDC (6 decimals)
      setUsdcBalance(formatUsdc(balanceWei));
    } catch (e) {
      console.warn('Failed to fetch native USDC balance:', e);
      setUsdcBalance('0.00');
    }
  }, []);

  // Connect wallet via EIP-1193 (window.ethereum)
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('No EVM wallet found. Please install MetaMask, Rabby, or another browser wallet.');
      return;
    }

    try {
      setIsConnecting(true);
      const ethereum = (window as any).ethereum;
      const accounts: string[] = await ethereum.request({ method: 'eth_requestAccounts' });
      const currentChainIdHex: string = await ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(currentChainIdHex, 16);

      if (accounts.length > 0) {
        const userAddr = accounts[0] as `0x${string}`;
        setAddress(userAddr);
        setChainId(currentChainId);
        await refreshBalance(userAddr);
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setUsdcBalance('0.00');
  }, []);

  // Switch or Add Arc Mainnet (Chain 5042) to wallet
  const switchToArc = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const ethereum = (window as any).ethereum;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13b2' }], // 5042 in hex
      });
      setChainId(5042);
      if (address) refreshBalance(address);
    } catch (switchError: any) {
      // 4902 error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13b2',
                chainName: 'Arc Mainnet',
                nativeCurrency: {
                  name: 'USDC',
                  symbol: 'USDC',
                  decimals: 6,
                },
                rpcUrls: ['https://rpc.mainnet.arc.io'],
                blockExplorerUrls: ['https://arc-scan.org'],
              },
            ],
          });
          setChainId(5042);
          if (address) refreshBalance(address);
        } catch (addError) {
          console.error('Failed to add Arc Mainnet to wallet:', addError);
        }
      } else {
        console.error('Failed to switch to Arc Mainnet:', switchError);
      }
    }
  }, [address, refreshBalance]);

  // Send transaction with gas token (USDC 6 decimals)
  const sendUsdc = useCallback(
    async (to: `0x${string}`, amountUsdc: string): Promise<`0x${string}`> => {
      if (!address || !(window as any).ethereum) throw new Error('Wallet not connected');
      const ethereum = (window as any).ethereum;
      const valueWei = parseUnits(amountUsdc, 6); // 6 decimals for USDC!

      const txHash: `0x${string}` = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: address,
            to,
            value: '0x' + valueWei.toString(16),
          },
        ],
      });
      return txHash;
    },
    [address]
  );

  // Listen to wallet events
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const newAddr = accounts[0] as `0x${string}`;
        setAddress(newAddr);
        refreshBalance(newAddr);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      if (address) refreshBalance(address);
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    // Initial check if already connected
    ethereum
      .request({ method: 'eth_accounts' })
      .then((accs: string[]) => {
        if (accs.length > 0) {
          setAddress(accs[0] as `0x${string}`);
          ethereum.request({ method: 'eth_chainId' }).then((cHex: string) => {
            const cid = parseInt(cHex, 16);
            setChainId(cid);
            refreshBalance(accs[0] as `0x${string}`);
          });
        }
      })
      .catch(() => {});

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
        ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [disconnectWallet, refreshBalance, address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isArcMainnet,
        isConnected,
        isConnecting,
        usdcBalance,
        connectWallet,
        disconnectWallet,
        switchToArc,
        sendUsdc,
        publicClient,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
