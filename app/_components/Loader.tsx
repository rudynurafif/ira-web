import React from "react";
import LoadingAnimation from "@/public/assets/IRA-Loader.json";
import Lottie from "lottie-react";

const Loader = () => {
  return (
    <div className="flex flex-col gap-4 justify-center items-center h-64">
      <Lottie
        width={104}
        height={104}
        className="w-[170px] sm:w-[190px] md:w-[200px] lg:w-60 lg:h-60"
        animationData={LoadingAnimation}
      />
      {/* <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-dark-primary-2"></div> */}
      {/* <div className="font-bold text-lg text-dark-primary-2">
        Mohon menunggu..
      </div> */}
    </div>
  );
};

export default Loader;
