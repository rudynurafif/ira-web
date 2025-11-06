import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-dark-primary-2"></div>
      <div className="font-bold text-lg text-dark-primary-2">
        Mohon menunggu..
      </div>
    </div>
  );
};

export default Loader;
