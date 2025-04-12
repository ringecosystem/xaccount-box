import { sepolia } from 'wagmi/chains';

import { type ChainConfig } from '@/types/chains';

export const ethereumSepolia: ChainConfig = {
  ...sepolia,
  iconUrl: '/images/chains/ethereumSepolia.svg',
  shortName: 'sep'
} as const satisfies ChainConfig;
