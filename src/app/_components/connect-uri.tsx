import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { WalletConnectManager } from '@/lib/walletConnect';
import { APP_DESCRIPTION, APP_NAME } from '@/config/site';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import type { TransactionWithId } from '@/contexts/ImpersonatorIframeContext';
import useGenerateAction from '@/hooks/useGenerateAction';
import { ActionPreview } from '@/components/action-preview';
import { Transaction } from '@/components/action-preview/content';

const WC_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
  metadata: {
    name: APP_NAME,
    description: APP_DESCRIPTION,
    url: 'xaccount.box',
    icons: ['https://xaccount.box/images/common/favicon.png']
  }
};

export const ConnectURI = ({
  timeLockContractAddress,
  targetAccount,
  sourceChainId,
  targetChainId,
  moduleAddress,
  disabled
}: {
  timeLockContractAddress?: `0x${string}`;
  targetAccount: string;
  sourceChainId: string;
  targetChainId: string;
  moduleAddress?: string;
  disabled?: boolean;
}) => {
  const [walletConnectUri, setWalletConnectUri] = useState<string>('');

  const [walletConnect, setWalletConnect] = useState<WalletConnectManager | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{
    name?: string;
    url?: string;
    icon?: string;
    description?: string;
  }>({});
  const [error, setError] = useState<string>('');
  const [walletConnectTransaction, setWalletConnectTransaction] = useState<Transaction | undefined>(
    undefined
  );
  const { generateAction, sourcePort, actionState, reset, isLoading } = useGenerateAction({
    timeLockContractAddress: timeLockContractAddress as `0x${string}`,
    moduleAddress: moduleAddress as `0x${string}`,
    sourceChainId: Number(sourceChainId),
    targetChainId: Number(targetChainId)
  });

  const handleChangeTransaction = useCallback(
    (transaction: TransactionWithId) => {
      console.log('New transaction received, current moduleAddress:', moduleAddress);
      if (!moduleAddress) {
        console.warn('No module address available');
        return;
      }
      generateAction({
        transactionInfo: transaction
      });
      setWalletConnectTransaction({
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        calldata: transaction.data
      });
    },
    [moduleAddress, generateAction]
  );

  // Initialize WalletConnect
  useEffect(() => {
    console.log('Effect triggered with targetChainId:', targetChainId);

    const initWalletConnect = async () => {
      if (!targetChainId) return;
      try {
        const manager = new WalletConnectManager(
          WC_CONFIG,
          `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_TOKEN}`
        );
        await manager.initializeWallet();

        // Set up connection status callback
        manager.onConnectionStatusChange((info) => {
          if (info.isConnected && info.dappInfo) {
            setConnectionInfo(info.dappInfo);
            setIsConnecting(false);
          }
        });

        // Set up transaction callback
        manager.setTransactionCallback((transaction) => {
          console.log('New transaction:', transaction, moduleAddress);
          if (transaction && moduleAddress) {
            handleChangeTransaction?.(transaction);
          }
          // Handle transaction UI updates here
        });

        setWalletConnect(manager);
      } catch (error) {
        console.error('Failed to initialize WalletConnect:', error);
      }
    };

    initWalletConnect();
  }, [targetChainId, handleChangeTransaction, moduleAddress]);

  // Update this effect to use updateSession when target account changes
  useEffect(() => {
    if (walletConnect && targetAccount) {
      walletConnect.setAddress(targetAccount).catch(console.error);
      // Add updateSession call for connected sessions
      if (walletConnect.getConnectionInfo().isConnected) {
        walletConnect.updateSession({ address: targetAccount }).catch(console.error);
      }
    }
  }, [walletConnect, targetAccount]);

  // Add new effect to handle chain ID changes
  useEffect(() => {
    if (walletConnect && walletConnect.getConnectionInfo().isConnected) {
      walletConnect.updateSession({ chainId: `eip155:${targetChainId}` }).catch(console.error);
    }
  }, [walletConnect, targetChainId]);

  const handleConnect = async () => {
    if (!walletConnect || isConnecting) return;
    if (!walletConnectUri) {
      toast.error('Invalid URI');
      return;
    }
    if (!targetAccount) {
      toast.error('Address is not an ENS or Ethereum address');
      return;
    }

    try {
      setError('');
      setIsConnecting(true);

      await walletConnect.setAddress(targetAccount);

      await walletConnect.pair(walletConnectUri);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const connectionInfo = walletConnect.getConnectionInfo();
      if (connectionInfo.isConnected) {
        await walletConnect.updateSession({
          address: targetAccount,
          chainId: `eip155:${targetChainId}`
        });
      }
    } catch (error) {
      console.error('Connection failed:', error);
      if (error instanceof Error && error.message.includes('Pairing already exists')) {
        setWalletConnectUri('');
        setError('This connection is invalid. Please get a new QR code or link from the dApp');
      } else {
        setError('Connection failed, please try again');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!walletConnect) return;

    try {
      setIsConnecting(true);
      await walletConnect.disconnect();
      setWalletConnectUri('');
    } catch (error) {
      console.error('Disconnect failed:', error);
      setError('Disconnect failed, please try again');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (!targetAccount || !walletConnectUri) {
      reset();
      return;
    }
    return () => {
      reset();
    };
  }, [walletConnectUri, targetAccount, reset]);

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="space-y-2">
        <label className="flex items-center gap-[5px] text-sm font-semibold leading-[150%] text-[#F6F1E8]/70">
          Wallet Connect URI
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
                Visit any dapp and select WalletConnect, then click &quot;Copy to clipboard&quot;
                beneath the QR code and paste it here.
              </p>
            </TooltipContent>
          </Tooltip>
        </label>
        <Input
          type="text"
          placeholder="wc:xyz123"
          value={walletConnectUri}
          onChange={(e) => setWalletConnectUri(e.target.value)}
          className="h-[62px] rounded-[8px] bg-[#262626] p-[20px] !text-[18px] font-medium leading-[130%] text-[#F6F1E8] placeholder:text-[18px] placeholder:text-[#666]"
          disabled={disabled}
        />
        {error && <p className="text-red-500">{error}</p>}
        {!walletConnect?.getConnectionInfo().isConnected && (
          <div className="flex items-center justify-center">
            <Button
              variant="secondary"
              isLoading={isConnecting}
              className="h-[50px] w-full max-w-[226px] rounded-[8px] bg-[#7838FF] text-sm font-medium leading-[150%] text-[#F6F1E8] hover:bg-[#7838FF]/80"
              disabled={!walletConnect || isConnecting || !walletConnectUri}
              onClick={handleConnect}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        )}
        {walletConnect?.getConnectionInfo().isConnected && (
          <div className="flex flex-col items-center justify-center gap-[20px]">
            <h3 className="text-center text-[14px] font-extrabold leading-normal text-[#F6F1E8]">
              Connected To
            </h3>
            {connectionInfo && (
              <div className="flex flex-col items-center gap-[5px]">
                {connectionInfo?.icon && (
                  <Image
                    src={connectionInfo?.icon}
                    alt={`${connectionInfo?.name || 'Dapp'} icon`}
                    className="object-cover"
                    width={56}
                    height={56}
                    sizes="56px"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-[14px] font-extrabold leading-normal text-[#F6F1E8]">
                  {connectionInfo?.name}
                </span>
                <span className="line-clamp-3 text-[14px] font-semibold leading-[150%] text-[#F6F1E8]/70">
                  {connectionInfo?.description}
                </span>

                <span className="text-[14px] font-semibold leading-[150%] text-[#F6F1E8]/70">
                  Go back to the dapp to make your call
                </span>
              </div>
            )}
            <Button
              onClick={handleDisconnect}
              variant="secondary"
              isLoading={isConnecting}
              className="h-[49px] rounded-[8px] bg-[#7838FF] p-[20px] hover:bg-[#7838FF]/80"
            >
              {isConnecting ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </div>
        )}
      </div>
      <ActionPreview
        isLoading={isLoading}
        sourcePort={sourcePort}
        transaction={walletConnectTransaction}
        sourceChainId={Number(sourceChainId)}
        targetChainId={Number(targetChainId)}
        moduleAddress={moduleAddress}
        message={actionState?.message}
        params={actionState?.params}
        fee={actionState?.fee}
      />
    </div>
  );
};
