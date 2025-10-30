import SkeletonBase from "./SkeletonBase";

const SkeletonButtonGroup = () => {
  return (
    <div className="flex space-x-2 mt-4">
      <SkeletonBase height="h-10" className="flex-1" />
    </div>
  );
};

export default SkeletonButtonGroup;
