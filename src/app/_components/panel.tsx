'use client';

import { Suspense, useMemo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tabs } from './tabs';
import { Select } from '@/components/select';
import { getChains, getChainById, getDefaultChainId } from '@/utils';
import { CreateXAccount } from './create-xaccount';
import { GenerateAction } from './generate-action';
import { AddressInput } from '@/components/address-input';
import { WalletGuard } from './wallet-guard';
import { useSearchParams, useRouter } from 'next/navigation';
import { isAddress } from 'viem';
import { motion } from 'framer-motion';
import { useMultiSourceState } from '@/hooks/useMultiSourceState';

interface DaoPanelProps {
  className?: string;
}

const chains = getChains();

const getFromChainIdFromUrl = (fromChainIdByUrl: string | null): string | undefined => {
  if (!fromChainIdByUrl) {
    return undefined;
  }
  const chain = getChainById(Number(fromChainIdByUrl));
  if (chain) {
    return chain?.id?.toString();
  }
  return undefined;
};

const getCompatibleChainId = (sourceChainId: string, defaultChainId?: string): string => {
  const sourceChain = getChainById(Number(sourceChainId));
  if (!sourceChain) {
    return '';
  }
  const compatibleChains = chains.filter(
    (chain) =>
      chain.testnet === sourceChain.testnet && chain.id.toString() !== sourceChainId?.toString()
  );

  if (compatibleChains.length) {
    if (
      defaultChainId &&
      compatibleChains.find((chain) => chain.id.toString() === defaultChainId)
    ) {
      return defaultChainId;
    }
    return compatibleChains[0].id.toString();
  }
  return '';
};

const chainOptions = chains.map((chain) => ({
  value: chain.id.toString(),
  label: chain.name,
  asset: chain.iconUrl as string
}));

function DaoPanelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const timeLockContractAddressFromUrl = searchParams.get('timeLockContractAddress');
  const fromChainIdFromUrl = searchParams.get('sourceChainId');
  const tabFromUrl = searchParams.get('tab') as 'create' | 'generate';

  const [activeTab, setActiveTab] = useState<typeof tabFromUrl>(tabFromUrl || 'create');

  const [timeLockContractAddress, setTimeLockContractAddress] = useMultiSourceState<
    `0x${string}` | ''
  >({
    key: 'timeLockContractAddress',
    urlParam:
      timeLockContractAddressFromUrl && isAddress(timeLockContractAddressFromUrl)
        ? timeLockContractAddressFromUrl
        : undefined,
    defaultValue: ''
  });

  const [sourceChainId, setSourceChainId] = useMultiSourceState({
    key: 'sourceChainId',
    urlParam: getFromChainIdFromUrl(fromChainIdFromUrl),
    defaultValue: getDefaultChainId()?.toString() || ''
  });

  const [targetChainId, setTargetChainId] = useState(getCompatibleChainId(sourceChainId));

  const targetChainOptions = useMemo(() => {
    const sourceChain = getChainById(Number(sourceChainId));
    if (!sourceChain) {
      return chainOptions;
    }

    return chains
      .filter(
        (chain) =>
          chain.testnet === sourceChain.testnet && chain.id.toString() !== sourceChainId?.toString()
      )
      .map((chain) => ({
        value: chain.id.toString(),
        label: chain.name,
        asset: chain.iconUrl as string
      }));
  }, [sourceChainId, chainOptions]);

  const timeLockContractAddressValid = useMemo(() => {
    return !!timeLockContractAddress && isAddress(timeLockContractAddress);
  }, [timeLockContractAddress]);

  const handleTimeLockContractAddressChange = (value: string) => {
    setTimeLockContractAddress(value as `0x${string}`);
  };

  const handleSourceChainChange = (value: string) => {
    setSourceChainId(value);
    setTargetChainId(getCompatibleChainId(value, targetChainId));
  };

  const handleTargetChainChange = (value: string) => {
    setTargetChainId(value);
    setSourceChainId(getCompatibleChainId(value, sourceChainId));
  };

  const handleTabChange = (tab: 'create' | 'generate') => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    router.push(`?${params.toString()}`);
    setActiveTab(tab);
  };

  return (
    <>
      <div className="flex flex-col gap-[20px]">
        <div className="space-y-2">
          <label className="text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
            Source Chain DAO TimeLock Contract
          </label>
          <AddressInput
            value={timeLockContractAddress}
            onChange={handleTimeLockContractAddressChange}
            placeholder="Input contract address"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
            Source Chain
          </label>
          <Select
            placeholder="Select Chain"
            options={chainOptions}
            value={sourceChainId?.toString() || ''}
            onValueChange={handleSourceChainChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
            Target Chain
          </label>
          <Select
            placeholder="Select Chain"
            options={targetChainOptions}
            value={targetChainId?.toString() || ''}
            onValueChange={handleTargetChainChange}
          />
        </div>
      </div>

      <Tabs activeTab={activeTab} setActiveTab={handleTabChange}>
        {activeTab === 'create' ? (
          <WalletGuard>
            <CreateXAccount
              timeLockContractAddress={
                timeLockContractAddressValid && timeLockContractAddress
                  ? timeLockContractAddress
                  : ''
              }
              sourceChainId={sourceChainId}
              targetChainId={targetChainId}
            />
          </WalletGuard>
        ) : (
          <GenerateAction
            timeLockContractAddress={
              timeLockContractAddressValid && timeLockContractAddress ? timeLockContractAddress : ''
            }
            sourceChainId={sourceChainId}
            targetChainId={targetChainId}
          />
        )}
      </Tabs>
    </>
  );
}

export function DaoPanel({ className }: DaoPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex w-full max-w-[540px] flex-col gap-[20px] rounded-[12px] border border-[#262626] p-[20px]',
        className
      )}
    >
      <header className="flex flex-col gap-[20px]">
        <div className="flex w-full items-center justify-end">
          <Image src="/images/common/logo.svg" alt="XAccount Logo" width={82} height={9} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[24px] font-semibold leading-[120%] text-[#F6F1E8]">DAO TOOL</h1>
          <h2 className="text-[34px] font-semibold leading-[120%] text-[#F6F1E8]">
            Generating Cross-chain Action
          </h2>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-10 rounded bg-neutral-800" />
            <div className="h-10 rounded bg-neutral-800" />
            <div className="h-10 rounded bg-neutral-800" />
          </div>
        }
      >
        <DaoPanelContent />
      </Suspense>
    </motion.div>
  );
}
