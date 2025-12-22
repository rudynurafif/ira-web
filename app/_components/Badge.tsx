const Badge = ({
  color,
  children,
}: {
  color: "green" | "red";
  children: React.ReactNode;
}) => (
  <span
    className={`ml-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${
      color === "green"
        ? "bg-[#22C55E]/15 text-green-primary border border-[#22C55E]/30"
        : "bg-[#EF4444]/15 text-red-primary border border-[#EF4444]/30"
    }`}
  >
    {children}
  </span>
);

export default Badge;
