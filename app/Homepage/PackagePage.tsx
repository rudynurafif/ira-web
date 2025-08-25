import React from "react";
import { packageList } from "../_shared/data/data";
import { convertToCurrency } from "../_shared/utils";

function PackagePage() {
  return (
    <div className="container mx-auto px-5 text-black my-[153px]">
      <h1 className="text-[32px] font-bold text-center">
        Mau internetan? Pilih paket yang cocok buat kamu di sini
      </h1>

      <div className="grid grid-cols-3 gap-5 mt-[72px]">
        {packageList.map((item: any, index: number) => {
          return (
            <div className="p-2.5 bg-[#a4b6e8]/20 rounded-xl">
              <div
                className={`shadow-[0_3px_14px_0_rgba(45,47,51,0.12)] bg-linear-[320deg] from-[${item.color}] from-[-103.13%] to-[#FFF] to-[100%] rounded-xl w-full py-8 px-5 relative`}
              >
                <h1 className="text-2xl font-bold">{item.name}</h1>
                <p className="text-4xl font-bold mt-4">
                  {convertToCurrency(item.price)}
                </p>
                <p className="text-sm mt-4">Berlaku {item.period} Hari</p>

                <div className="absolute bottom-0 right-0 px-6 py-3 bg-dark-primary text-white rounded-tl-xl rounded-br-xl">
                  <p className="font-bold text-center text-sm">Speed Up to</p>
                  <p className="text-3xl font-bold text-center">
                    100 <span className="text-sm">Mbps</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PackagePage;
