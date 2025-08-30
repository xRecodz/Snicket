"use client"

import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { WagmiConfig, Chain } from 'wagmi'
import { http } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Custom chain: Somnia
const somnia: Chain = {
  id: 50312,
  name: 'Somnia',
  nativeCurrency: {
    name: 'Somnia Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
    public: { http: ['https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network', // ganti dengan URL explorer resmi kalau ada
    },
  },
  testnet: false,
}

const config = getDefaultConfig({
  appName: 'Snicket',
  projectId: '0e0f865f2e43c787cf6610f5f80fe5f1', // ganti dengan projectId WalletConnect Anda
  chains: [somnia],
  transports: {
    [somnia.id]: http('https://dream-rpc.somnia.network'),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={[somnia]}>
          {children}
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}
