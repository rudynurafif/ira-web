import { PackageData } from "@/app/_shared/types/customer-area";
import Image from "next/image";
import petir from "@/public/assets/Icons/petir.svg";

function PackageCardMobile({
  pkg,
  selected,
  onSelect,
  convertToCurrency,
}: {
  pkg: PackageData;
  selected: boolean;
  onSelect: (p: PackageData) => void;
  convertToCurrency: (v: number) => string;
}) {
  return (
    <div
      onClick={() => onSelect(pkg)}
      className={[
        "rounded-xl border bg-[url('/assets/Images/packageBackground.svg')] bg-cover bg-center cursor-pointer transition px-4 pt-3 pb-4",
        selected
          ? "border-[#D7201D] ring-1 ring-[#D7201D]/30 shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
          : "border-gray-200 active:scale-[0.99]",
      ].join(" ")}
    >
      {/* judul */}
      <div className="flex items-center gap-1">
        <span className="text-base">
          <Image src={petir} alt="icon" />
        </span>
        <h3 className="text-base sm:text-xl font-semibold text-secondary">
          {pkg?.name ?? "-"}
        </h3>
      </div>

      {/* body */}
      <div className="mt-2 ">
        {/* speed block */}
        <div className="w-full rounded-md overflow-hidden">
          <div className="flex max-[420px]:flex-col max-[420px]:gap-2 items-start justify-between w-full relative text-dark-primary-2 whitespace-nowrap">
            <div className="flex gap-2">
              <div className="text-xs sm:text-sm">Up to</div>
              <div className="flex pt-2 gap-1">
                <div className="text-3xl sm:text-4xl leading-none font-extrabold tracking-tight">
                  {pkg?.speed_mbps}
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-xs sm:text-sm font-semibold">Mbps</div>
                  <div className="text-[10px] sm:text-xs">Unlimited Kuota</div>
                </div>
              </div>
            </div>

            {/* badge harga */}
            <div className="shrink-0 ml-2 max-[420px]:ml-0 max-[420px]:w-full max-[420px]:flex max-[420px]:justify-end">
              <span className="inline-flex flex-col sm:flex-row max-w-100 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm text-black whitespace-nowrap">
                <p className="max-[420px]:font-bold font-semibold">
                  {convertToCurrency(pkg?.price ?? 0)}
                </p>
                <p className="font-semibold">/{pkg?.duration ?? 0} Hari</p>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* remarks optional */}
      {pkg?.remarks ? (
        <div className="mt-2 text-[10px] sm:text-xs text-dark-primary">
          {pkg?.remarks}
        </div>
      ) : null}
    </div>
  );
}

export default PackageCardMobile;
