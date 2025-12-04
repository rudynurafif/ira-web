import React from "react";

const FAQLoading = () => {
  return (
    <div className="w-full animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="mb-3 bg-white border border-gray-border px-8 py-5 rounded-xl"
        >
          {/* Title row */}
          <div className="flex justify-between items-center gap-4">
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-6 bg-gray-200 rounded"></div>
          </div>

          {/* Description skeleton (only visible as placeholder, not accordion style) */}
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded"></div>
            <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQLoading;
