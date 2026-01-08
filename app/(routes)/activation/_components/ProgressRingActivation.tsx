function ProgressRing({ percent }: { percent: number }) {
  const angle = Math.min(100, Math.max(0, percent)) * 3.6;
  return (
    <div
      className="w-27.5 h-27.5 mx-auto rounded-full relative"
      style={{
        background: `conic-gradient(#005FB8 ${angle}deg, #E5E7EB 0deg)`,
      }}
    >
      <div className="absolute inset-2.5 bg-white rounded-full flex items-center justify-center">
        <span className="font-bold text-old-primary">
          {Math.floor(percent)}%
        </span>
      </div>
    </div>
  );
}

export default ProgressRing;
