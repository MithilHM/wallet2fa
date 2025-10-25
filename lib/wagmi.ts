'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Wallet2FA',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'ee434b5bab05f697e93229ed38518209',
  chains: [sepolia],
  ssr: true,
});
