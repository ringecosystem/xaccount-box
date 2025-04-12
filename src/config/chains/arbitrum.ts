import { arbitrum as arbitrumBase } from 'wagmi/chains';

import { type ChainConfig } from '@/types/chains';

export const arbitrum: ChainConfig = {
  ...arbitrumBase,
  iconUrl: '/images/chains/arbitrum.svg',
  shortName: 'arb'
} as const satisfies ChainConfig;
