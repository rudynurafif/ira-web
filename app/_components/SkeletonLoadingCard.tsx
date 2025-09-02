import React from "react";

const SkeletonLoadingCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] p-8 max-sm:p-4">
      <div className="animate-pulse space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
        <div className="flex space-x-2 mt-4">
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoadingCard;
