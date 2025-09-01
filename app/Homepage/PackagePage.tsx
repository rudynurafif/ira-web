import React from "react";
import { packageList } from "../_shared/data/data";
import { convertToCurrency } from "../_shared/utils";
import Image from "next/image";
import imageCubmu from "@/public/assets/Images/cubmu.svg";

function PackagePage() {
  return (
    <div className="container mx-auto px-5 text-black my-16 pt-10">
      <h1 className="text-[32px] max-sm:text-[24px] font-bold text-center">
        Mau internetan? Pilih paket yang cocok buat kamu di sini
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-[72px]">
        {packageList.map((item: any, index: number) => {
          return (
            <div
              key={index}
              className="p-2.5 h-full bg-[#a4b6e8]/20 rounded-xl flex  flex-col"
            >
              <div
                style={{
                  background: `linear-gradient(320deg, ${item.color} -103%, #FFF 100%)`,
                }}
                className="shadow-[0_3px_14px_0_rgba(45,47,51,0.12)] rounded-xl w-full flex-1 p-5 relative flex flex-col justify-between"
              >
                {/* Nama Paket */}
                <div>
                  <h1 className="text-2xl max-sm:text-lg font-bold leading-tight">
                    {item.name}
                  </h1>
                  <p className="text-4xl max-sm:text-3xl font-bold mt-2">
                    {convertToCurrency(item.price)}
                  </p>
                  <p className="text-sm mt-2">Berlaku {item.period} Hari</p>
                </div>

                {/* Speed Badge */}
                <div className="absolute bottom-0 right-0 px-6 py-3 bg-dark-primary-2 text-white rounded-tl-xl rounded-br-xl">
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

      <div className="mx-auto w-full max-w-4xl mt-16 max-lg:mt-10 max-sm:mt-7">
        <button className="w-full px-4 bg-dark-primary-2 hover:bg-dark-primary cursor-pointer text-white py-4 rounded-xl text-xl max-sm:text-sm">
          <span className="font-bold">Daftar Sekarang</span> - Dapatkan promo 1
          bulan GRATIS! 🎉
        </button>
      </div>

      <div className="mt-[144px] max-sm:mt-16">
        <Image alt="cubmu" src={imageCubmu} className="w-full" />
      </div>
    </div>
  );
}

export default PackagePage;
