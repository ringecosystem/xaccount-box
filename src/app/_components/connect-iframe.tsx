import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { ImpersonatorIframe } from '@/components/ImpersonatorIframe';
import { getChainById, isValidUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ActionPreview } from '@/components/action-preview';
import useGenerateAction from '@/hooks/useGenerateAction';
import { useImpersonatorIframe } from '@/contexts/ImpersonatorIframeContext';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { SupportDapps } from '@/components/support-dapps';
import { SafeDappInfo } from '@/types/communicator';

export const ConnectIframe = ({
  timeLockContractAddress,
  moduleAddress,
  sourceChainId,
  targetAccount,
  targetChainId
}: {
  timeLockContractAddress: string;
  moduleAddress: string;
  sourceChainId: string;
  targetAccount: string;
  targetChainId: string;
}) => {
  const [iframeConnectUri, setIframeConnectUri] = useLocalStorageState<string>(
    'iframeConnectUri',
    ''
  );
  const [uri, setUri] = useState('');
  const [isSupportDappsOpen, setIsSupportDappsOpen] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const targetChain = getChainById(Number(targetChainId));
  const rpc = targetChain?.rpcUrls?.default?.http?.[0];
  // const rpc = 'https://eth.llamarpc.com';
  const { latestTransaction, iframeRef } = useImpersonatorIframe();

  const connectToUrl = useCallback(
    (url: string) => {
      if (!url || !isValidUrl(url)) {
        toast.error('Invalid URL');
        return false;
      }

      if (!targetAccount) {
        toast.error('Address is not an ENS or Ethereum address');
        return false;
      }

      if (!rpc) {
        toast.error('RPC is not available');
        return false;
      }

      setUri('');
      setTimeout(() => {
        setUri(url);
      }, 100);
      setIsIframeLoading(true);
      return true;
    },
    [targetAccount, rpc, setUri, setIsIframeLoading]
  );

  const handleConnect = useCallback(() => {
    connectToUrl(iframeConnectUri);
  }, [iframeConnectUri, connectToUrl]);

  const handleSelectDapp = useCallback(
    (dapp: SafeDappInfo) => {
      const url = dapp.url;
      setIframeConnectUri(url);
      if (connectToUrl(url)) {
        setIsSupportDappsOpen(false);
      }
    },
    [setIframeConnectUri, connectToUrl, setIsSupportDappsOpen]
  );

  const handleIframeLoad = useCallback(() => {
    setIsIframeLoading(false);
    if (iframeRef.current) {
      const yOffset =
        iframeRef.current.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
      window.scrollTo({
        top: yOffset,
        behavior: 'smooth'
      });
    }
  }, [setIsIframeLoading, iframeRef]);

  const handleIframeError = useCallback(() => {
    toast.error('Failed to load iframe');
    setIsIframeLoading(false);
  }, [setIsIframeLoading]);

  const { generateAction, sourcePort, actionState, reset, isLoading } = useGenerateAction({
    timeLockContractAddress: timeLockContractAddress as `0x${string}`,
    moduleAddress: moduleAddress as `0x${string}`,
    sourceChainId: Number(sourceChainId),
    targetChainId: Number(targetChainId)
  });

  useEffect(() => {
    if (!targetAccount || !iframeConnectUri) {
      reset();
      return;
    }
    if (latestTransaction) {
      generateAction({
        transactionInfo: latestTransaction
      });
    }
    return () => {
      reset();
    };
  }, [latestTransaction, iframeConnectUri, targetAccount, generateAction, reset]);

  return (
    <div className="space-y-[20px]">
      <header className="flex items-center justify-between">
        <label className="flex items-center gap-[5px] text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
          Dapp URL
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
                Paste the URL of the DApp you wish to connect to. If that DApp is not supported,
                please use WalletConnect.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="0 rounded-[8px] text-sm font-medium leading-[150%] text-[#F6F1E8]"
          onClick={() => setIsSupportDappsOpen(true)}
        >
          Supported Dapps
        </Button>
      </header>

      <div className="relative">
        <Input
          type="text"
          placeholder="https://app.uniswap.org/"
          value={iframeConnectUri}
          onChange={(e) => setIframeConnectUri(e.target.value)}
          className="h-[62px] rounded-[8px] bg-[#262626] p-[20px] pr-[50px] !text-[18px] font-medium leading-[130%] text-[#F6F1E8] placeholder:text-[18px] placeholder:text-[#666]"
        />
      </div>
      <div className="flex items-center justify-center">
        <Button
          variant="secondary"
          isLoading={isIframeLoading}
          className="h-[50px] w-full max-w-[226px] rounded-[8px] bg-[#7838FF] text-sm font-medium leading-[150%] text-[#F6F1E8] hover:bg-[#7838FF]/80"
          disabled={!iframeConnectUri || !isValidUrl(iframeConnectUri)}
          onClick={handleConnect}
        >
          Connect
        </Button>
      </div>
      {uri && targetAccount && rpc && (
        <div className="relative flex h-[510px] justify-center">
          <div className="absolute left-1/2 -translate-x-1/2">
            <ImpersonatorIframe
              key={uri}
              targetChainId={targetChainId}
              width={'1000px'}
              height={'510px'}
              src={uri}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              address={targetAccount}
              rpcUrl={rpc}
            />
          </div>
        </div>
      )}
      <ActionPreview
        isLoading={isLoading}
        sourcePort={sourcePort}
        transaction={
          latestTransaction
            ? {
                from: latestTransaction?.from,
                to: latestTransaction?.to,
                value: latestTransaction?.value,
                calldata: latestTransaction?.data
              }
            : undefined
        }
        sourceChainId={Number(sourceChainId)}
        targetChainId={Number(targetChainId)}
        moduleAddress={moduleAddress}
        message={actionState?.message}
        params={actionState?.params}
        fee={actionState?.fee}
      />
      <SupportDapps
        networkId={Number(targetChainId)}
        open={isSupportDappsOpen}
        onOpenChange={setIsSupportDappsOpen}
        onSelect={handleSelectDapp}
      />
    </div>
  );
};
