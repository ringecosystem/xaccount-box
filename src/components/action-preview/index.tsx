import { AnimatePresence, motion } from 'framer-motion';
import { Content, Transaction } from './content';

interface ActionPreviewProps {
  isLoading?: boolean;
  transaction?: Transaction;
  sourcePort?: string;
  sourceChainId?: number;
  targetChainId?: number;
  moduleAddress?: string;
  message?: string;
  params?: any;
  fee?: any;
}

export function ActionPreview({
  isLoading,
  transaction,
  sourcePort,
  sourceChainId,
  targetChainId,
  moduleAddress,
  message,
  params,
  fee
}: ActionPreviewProps) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="rounded-[8px] border border-neutral-800 bg-neutral-900/50 p-6"
        >
          {/* Loading skeleton that matches ActionPreview layout */}
          <div className="flex w-full flex-col gap-[12px] rounded-[8px] bg-[#1A1A1A] p-[22px]">
            <header className="flex items-center justify-between">
              <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
              <div className="h-[18px] w-[18px] animate-pulse rounded bg-neutral-800" />
            </header>
            <div className="space-y-3">
              {[...Array(10)].map((_, index) => (
                <div
                  key={index}
                  className="h-4 w-full animate-pulse rounded bg-neutral-800"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Content
            transaction={transaction!}
            sourcePort={sourcePort!}
            sourceChainId={sourceChainId!}
            targetChainId={targetChainId!}
            moduleAddress={moduleAddress!}
            message={message!}
            params={params!}
            fee={fee!}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
