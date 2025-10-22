import React from "react";

type SkeletonBaseProps = {
  width?: string;
  height?: string;
  className?: string;
};

const SkeletonBase: React.FC<SkeletonBaseProps> = ({
  width = "w-full",
  height = "h-8",
  className,
}) => {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${width} ${height} ${
        className ?? ""
      }`}
    ></div>
  );
};

export default SkeletonBase;
