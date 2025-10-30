import { convertToCurrency } from "@/app/_shared/utils";
import React from "react";
import { FaCircleCheck } from "react-icons/fa6";

function PackageCard({ paket, isActive }: { paket: any; isActive?: boolean }) {
  return (
    <div
      className={`w-full bg-[#F5F5F5] p-6 rounded-xl ${
        isActive && "border border-primary"
      }`}
    >
      <p className="p-0 m-0">{paket.name}</p>
      <p className="p-0 mt-1">
        <span className="text-[28px]  font-extrabold">
          {convertToCurrency(paket.price)}
        </span>{" "}
        / berlaku {paket.period} Hari
      </p>
      <ul className="list-none list-inside mt-5">
        {paket.benefit.map((benefit: any, index: number) => {
          return (
            <li
              key={"benefit-" + index}
              className="flex gap-2 items-start mb-1"
            >
              <FaCircleCheck size={20} color="#308FFF" className="mt-[2px]" />
              <p>{benefit}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PackageCard;
