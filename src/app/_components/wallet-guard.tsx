import { ContentSkeleton } from '@/components/content-skeleton';
import { Button } from '@/components/ui/button';
import { getChainById } from '@/utils';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export const WalletGuard = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, address, chainId, isConnecting } = useAccount();

  const { openConnectModal } = useConnectModal();
  const activeChain = getChainById(chainId);

  if (isConnecting) {
    return <ContentSkeleton />;
  }

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center">
        <Button
          variant="secondary"
          className="h-[50px] w-full max-w-[226px] rounded-[8px] bg-[#7838FF] text-sm font-medium leading-[150%] text-[#F6F1E8] hover:bg-[#7838FF]/80"
          onClick={openConnectModal}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  if (!activeChain) {
    return (
      <div className="flex items-center justify-center">
        <Button
          variant="secondary"
          disabled
          className="h-[50px] w-full max-w-[226px] rounded-[8px] bg-[#FF0000] text-sm font-medium leading-[150%] text-[#F6F1E8] hover:bg-[#FF0000]/80"
        >
          Wrong Network
        </Button>
      </div>
    );
  }
  return <div className="flex-1">{children}</div>;
};
