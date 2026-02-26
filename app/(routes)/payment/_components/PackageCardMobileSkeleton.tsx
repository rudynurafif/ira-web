import React from "react";

function PackageCardMobileSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden px-4 pt-3 pb-4">
      {/* shimmer overlay */}
      <div className="relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" />
        {/* header */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-gray-200" />
          <div className="h-5 w-40 rounded bg-gray-200" />
        </div>

        {/* body */}
        <div className="mt-4 flex items-start justify-between">
          <div className="flex gap-2">
            <div className="h-4 w-10 rounded bg-gray-200" />
            <div className="flex pt-2 gap-2">
              <div className="h-10 w-20 rounded bg-gray-200" />
              <div className="flex flex-col gap-2 pt-1">
                <div className="h-4 w-12 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>
          </div>

          {/* price badge */}
          <div className="ml-2">
            <div className="h-10 w-28 rounded-lg bg-gray-200" />
          </div>
        </div>

        {/* remarks */}
        <div className="mt-4 h-3 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function PackageCardMobileSkeletonList({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="md:grid grid-cols-1 lg:grid-cols-2 gap-4 max-sm:space-y-6">
        {Array.from({ length: count }).map((_, i) => (
          <PackageCardMobileSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export default PackageCardMobileSkeleton;
