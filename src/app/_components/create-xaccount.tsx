'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAccount, useSwitchChain } from 'wagmi';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PortSelect } from '@/app/_components/port-select';
import { CROSS_CHAIN_ENDPOINTS } from '@/config/cross-chain-endpoints';
import { AddressInput } from '@/components/address-input';
import { useDisconnectWallet } from '@/hooks/useDisconnectWallet';
import { getChainById } from '@/utils';
import { useCreateXAccount } from '@/hooks/useCreateXAccount';
import { useRemoteAddressExistence } from '@/hooks/useRemoteAddressExistence';
import { JsonRpcProvider } from 'ethers';
import { useXAccountOf } from '@/hooks/usexAccountOf';
import { useSafeAddress } from '@/providers/address-provider';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Avatar from '@/components/avatar';

export const CreateXAccount = ({
  timeLockContractAddress,
  sourceChainId,
  targetChainId
}: {
  timeLockContractAddress: string;
  sourceChainId: string;
  targetChainId: string;
}) => {
  const { address, chainId } = useAccount();
  const [port, setPort] = useState<string>(Object.values(CROSS_CHAIN_ENDPOINTS)[0]);
  const [recoveryAccount, setRecoveryAccount] = useState<`0x${string}` | ''>(
    '0x0000000000000000000000000000000000000000'
  );
  const [recoveryAccountValid, setRecoveryAccountValid] = useState(false);
  const { disconnectWallet } = useDisconnectWallet();
  const { safeAddress } = useSafeAddress();
  const { switchChain } = useSwitchChain();

  const { data: xAccount } = useXAccountOf({
    deployer: address as `0x${string}`,
    sourceChainId: BigInt(sourceChainId || 0),
    targetChainId: Number(targetChainId),
    owner: timeLockContractAddress as `0x${string}`
  });

  const provider = useMemo(() => {
    const chain = getChainById(Number(targetChainId));
    return chain ? new JsonRpcProvider(chain.rpcUrls.default.http[0]) : undefined;
  }, [targetChainId]);

  const { isLoading: isRemoteAddressLoading } = useRemoteAddressExistence({
    xAccount,
    provider
  });

  const { createXAccount, isPending, isTransactionReceiptLoading } = useCreateXAccount(
    Number(targetChainId),
    xAccount,
    provider
  );

  const disabled =
    !chainId ||
    !timeLockContractAddress ||
    !sourceChainId ||
    !targetChainId ||
    !recoveryAccountValid ||
    !port;

  const recoveryAccountIsSameAsCurrentAccount =
    recoveryAccount &&
    (recoveryAccount?.toLocaleLowerCase() === address?.toLocaleLowerCase() ||
      recoveryAccount?.toLocaleLowerCase() === timeLockContractAddress?.toLocaleLowerCase());

  const handleCreate = useCallback(async () => {
    if (timeLockContractAddress && port) {
      createXAccount(
        BigInt(sourceChainId),
        timeLockContractAddress as `0x${string}`,
        port as `0x${string}`,
        recoveryAccount
          ? recoveryAccount
          : ('0x0000000000000000000000000000000000000000' as `0x${string}`)
      )?.catch((error) => {
        console.log('error', error);
        toast.error(error?.shortMessage || 'Failed to create xaccount');
      });
    }
  }, [sourceChainId, createXAccount, recoveryAccount, timeLockContractAddress, port]);

  const sourceChain = getChainById(Number(sourceChainId));
  const targetChain = getChainById(Number(targetChainId));

  useEffect(() => {
    if (targetChainId) {
      setTimeout(() => {
        switchChain({ chainId: Number(targetChainId) });
      }, 1000);
    }
  }, [targetChainId, switchChain]);

  const handleDisconnect = useCallback(() => {
    disconnectWallet(address);
  }, [address, disconnectWallet]);

  return (
    <>
      <div className="relative flex flex-col gap-[20px]">
        {isRemoteAddressLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[8px] bg-[#1A1A1A]/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#7838FF]" />
                <span className="text-[16px] font-medium text-[#F6F1E8]">
                  Checking XAccount status...
                </span>
              </div>
              <p className="text-[14px] text-[#F6F1E8]/70">
                Verifying address existence on target chain
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            'flex w-full items-center gap-[12px] rounded-[8px] bg-[#262626] p-[20px]',
            isRemoteAddressLoading && 'opacity-50'
          )}
        >
          <span className="inline-block h-[9px] w-[9px] flex-shrink-0 rounded-full bg-[#00C739]"></span>
          {address && <Avatar address={address} className="flex-shrink-0" />}
          <span className="break-all font-mono text-[18px] font-medium leading-[20px] text-[#F6F1E8]">
            {address}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-[8px] bg-[#7838FF] p-[10px] text-[14px] text-sm font-medium leading-[150%] text-[#F6F1E8] hover:bg-[#7838FF]/80"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
        {safeAddress ? (
          <div className="flex w-full flex-col items-center justify-center gap-[20px] rounded-[8px] bg-[#1A1A1A] p-[20px]">
            <div className="flex w-full flex-col items-center justify-center">
              <Link
                className="font-mono text-[18px] font-extrabold leading-[130%] text-[#F6F1E8] underline hover:text-[#F6F1E8]/80"
                href={`${sourceChain?.blockExplorers?.default.url}/address/${timeLockContractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {timeLockContractAddress}
              </Link>
              <span className="text-[18px] font-medium leading-[130%] text-[#F6F1E8]">
                has created an XAccount
              </span>
              <Link
                className="font-mono text-[18px] font-bold leading-[130%] text-[#F6F1E8] underline hover:text-[#F6F1E8]/80"
                href={`${targetChain?.blockExplorers?.default.url}/address/${safeAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {safeAddress}
              </Link>
            </div>

            <div className="flex w-full flex-col items-center justify-center">
              <span className="text-center text-[18px] font-medium leading-[130%] text-[#F6F1E8]">
                Please use it to generate an action or switch to another account to create a new
                XAccount.
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <AddressInput
                value={recoveryAccount}
                onChange={setRecoveryAccount}
                placeholder="Input Recovery Account"
                label={
                  <>
                    Recovery Account(Optional)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image
                          src="/images/common/info.svg"
                          alt="info"
                          width={16}
                          height={16}
                          className="inline-block cursor-pointer"
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[280px] bg-[#1A1A1A]">
                        <p className="text-[12px] font-normal leading-normal text-[#F6F1E8]">
                          The recovery account can be used to recover your xaccount in case of an
                          emergency.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                }
                onValidationChange={setRecoveryAccountValid}
              />
              {recoveryAccountIsSameAsCurrentAccount && (
                <span className="text-[16px] font-normal leading-[100%] tracking-[0.32px] text-[#FF0000]">
                  The recovery account should be a dedicated one that is under your control.
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
                <span className="flex items-center gap-[5px]">
                  Port
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Image
                        src="/images/common/info.svg"
                        alt="info"
                        width={16}
                        height={16}
                        className="inline-block cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[280px] bg-[#1A1A1A]">
                      <p className="text-[12px] font-normal leading-normal text-[#F6F1E8]">
                        The port denotes the cross-chain message protocols that will facilitate the
                        exchange of information between chains.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </span>
              </label>
              <PortSelect
                value={port}
                onValueChange={(value: string) =>
                  setPort(value as keyof typeof CROSS_CHAIN_ENDPOINTS)
                }
              />
            </div>

            <div className="flex items-center justify-center">
              <Button
                variant="secondary"
                disabled={disabled}
                onClick={handleCreate}
                isLoading={isPending || isTransactionReceiptLoading || isRemoteAddressLoading}
                className="h-[50px] w-full max-w-[226px] rounded-[8px] bg-[#7838FF] text-sm font-medium leading-[150%] text-[#F6F1E8] hover:bg-[#7838FF]/80"
              >
                Create
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
