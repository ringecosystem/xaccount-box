import { ethereumSepolia, arbitrumSepolia, darwinia, ethereum, arbitrum } from '@/config/chains';
import { ChainConfig, ChainId } from '@/types/chains';

import type { Chain } from '@rainbow-me/rainbowkit';

const chainConfigMap: Record<number, Chain> = {
  [ChainId.ETHEREUM]: ethereum,
  [ChainId.ARBITRUM]: arbitrum,
  [ChainId.DARWINIA]: darwinia,
  [ChainId.ETHEREUM_SEPOLIA]: ethereumSepolia,
  [ChainId.ARBITRUM_SEPOLIA]: arbitrumSepolia
};

// Returns an array of all chain configurations, filtering based on deployment mode
export function getChains(): [ChainConfig, ...ChainConfig[]] {
  const chains: Chain[] = Object.values(chainConfigMap);
  if (chains.length === 0) {
    throw new Error('No suitable chain configurations are available.');
  }
  return chains as [Chain, ...Chain[]];
}

// Returns the chain by its id
export function getChainById(id?: ChainId): Chain | undefined {
  return id ? chainConfigMap[id] : undefined;
}

// Returns the default chain configuration based on deployment mode
export function getDefaultChain(): Chain {
  const chains = Object.values(chainConfigMap);
  if (chains.length === 0) {
    throw new Error(
      'No suitable chain configurations are available for the current deployment mode.'
    );
  }

  const defaultChainId = ChainId.ETHEREUM;
  const defaultChain = chains.find((chain) => chain.id === defaultChainId);

  return defaultChain || chains[0];
}

// Returns the default chain id based on the default chain
export function getDefaultChainId(): ChainId {
  const defaultChain = getDefaultChain();
  return defaultChain.id;
}
