import { darwinia as darwiniaBase } from 'wagmi/chains';

import { type ChainConfig } from '@/types/chains';

export const darwinia: ChainConfig = {
  ...darwiniaBase,
  iconUrl: '/images/chains/darwinia.png',
  shortName: 'darwinia'
} as const satisfies ChainConfig;
