'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const ContentSkeleton = () => {
  return (
    <div className="flex flex-col gap-[20px] animate-in fade-in-50">
      {/* Common header block (like address display) */}
      <div className="flex w-full items-center gap-[12px] rounded-[8px] bg-[#262626] p-[20px]">
        <Skeleton className="h-[9px] w-[9px] rounded-full" />
        <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-[38px] w-[100px]" />
      </div>

      {/* Input fields skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-[62px] w-full rounded-[8px]" />
      </div>

      {/* Port/Account selection skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-[62px] w-full rounded-[8px]" />
      </div>

      {/* Action button skeleton */}
      <div className="flex items-center justify-center">
        <Skeleton className="h-[50px] w-full max-w-[226px] rounded-[8px]" />
      </div>
    </div>
  );
};
