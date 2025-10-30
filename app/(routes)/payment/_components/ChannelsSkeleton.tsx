 const ChannelsSkeleton = () => {
  return (
    <div className="container mx-auto my-8 p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        {/* Title Skeleton */}
        <div className="h-8 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>

        {/* Virtual Account Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-32 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(7)].map((_, i) => (
              <div
                key={`va-${i}`}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* QRIS Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-20 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={`qris-${i}`}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* E-Wallet Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-24 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={`ewallet-${i}`}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Outlet Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-16 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
          <div className="grid grid-cols-1 gap-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={`outlet-${i}`}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="w-full h-14 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

export default ChannelsSkeleton
