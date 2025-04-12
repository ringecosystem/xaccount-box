'use client';

import { Suspense } from 'react';
import { Select } from '@/components/select';
import { useCallback, useEffect, useState, useMemo } from 'react';
import ConnectTabs from './connect-tabs';
import { ConnectURI } from './connect-uri';
import { ConnectIframe } from './connect-iframe';
import { useGetDeployed } from '@/hooks/useGetDeployed';
import { ContentSkeleton } from '@/components/content-skeleton';
import { AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

function GenerateActionContent({
  timeLockContractAddress,
  sourceChainId,
  targetChainId
}: {
  timeLockContractAddress: string;
  sourceChainId: string;
  targetChainId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('connectType') as 'wallet' | 'iframe') || 'wallet';
  const [targetAccount, setTargetAccount] = useState('');

  const {
    data: deployedXAccounts,
    isLoading: isDeployedXAccountsLoading,
    refetch,
    isRefetching: isRefetchingDeployedXAccounts
  } = useGetDeployed({
    fromChainId: sourceChainId ? BigInt(sourceChainId) : BigInt(0),
    targetChainId: Number(targetChainId),
    owner: timeLockContractAddress as `0x${string}`
  });

  const moduleAddress = useMemo(() => {
    if (!deployedXAccounts || deployedXAccounts.length < 2) return '';
    const [xAccounts, modules] = deployedXAccounts;
    const index = xAccounts.findIndex((account) => account === targetAccount);
    return index !== -1 ? modules[index] : '';
  }, [deployedXAccounts, targetAccount]);

  const handleTabChange = useCallback(
    (tab: 'wallet' | 'iframe') => {
      const params = new URLSearchParams(searchParams);
      params.set('connectType', tab);
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (deployedXAccounts && deployedXAccounts.length > 0) {
      setTargetAccount(deployedXAccounts[0][0]);
    } else {
      setTargetAccount('');
    }
    return () => {
      setTargetAccount('');
    };
  }, [deployedXAccounts]);

  useEffect(() => {
    if (sourceChainId && timeLockContractAddress) {
      refetch();
    }
  }, [refetch, sourceChainId, timeLockContractAddress]);

  if (isDeployedXAccountsLoading || isRefetchingDeployedXAccounts) {
    return <ContentSkeleton />;
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="space-y-2">
        <label className="text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
          Corresponding XAccounts
        </label>
        <Select
          placeholder="Select account on target chain"
          options={
            Array.isArray(deployedXAccounts?.[0]) && deployedXAccounts[0].length > 0
              ? deployedXAccounts[0]
                  .filter(([xAccount]) => xAccount)
                  .map((xAccount) => ({
                    value: xAccount,
                    label: xAccount
                  }))
              : []
          }
          value={targetAccount}
          onValueChange={setTargetAccount}
          empty={
            <div className="flex items-center gap-2 p-4">
              <AlertCircle className="h-5 w-5 text-[#666] opacity-50" />
              <p className="text-[16px] font-medium text-[#666]">No accounts available</p>
            </div>
          }
        />
      </div>

      <ConnectTabs activeTab={activeTab} onTabChange={handleTabChange}>
        <AnimatePresence mode="wait">
          {activeTab === 'wallet' ? (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <ConnectURI
                timeLockContractAddress={timeLockContractAddress as `0x${string}`}
                targetAccount={targetAccount}
                targetChainId={targetChainId}
                sourceChainId={sourceChainId}
                moduleAddress={moduleAddress}
              />
            </motion.div>
          ) : (
            <motion.div
              key="iframe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ConnectIframe
                timeLockContractAddress={timeLockContractAddress as `0x${string}`}
                moduleAddress={moduleAddress}
                sourceChainId={sourceChainId}
                targetAccount={targetAccount}
                targetChainId={targetChainId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ConnectTabs>
    </div>
  );
}

export function GenerateAction({
  timeLockContractAddress,
  sourceChainId,
  targetChainId
}: {
  timeLockContractAddress: string;
  sourceChainId: string;
  targetChainId: string;
}) {
  return (
    <Suspense fallback={<ContentSkeleton />}>
      <GenerateActionContent
        timeLockContractAddress={timeLockContractAddress}
        sourceChainId={sourceChainId}
        targetChainId={targetChainId}
      />
    </Suspense>
  );
}
