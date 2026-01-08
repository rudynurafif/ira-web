import Image from "next/image";
import React from "react";

import registerIcon from "@/public/assets/Icons/success-register.svg";

function ModalScan({
  scanAgain,
  dataScan,
}: {
  scanAgain: any;

  dataScan: string | null;
}) {
  return (
    <div>
      <span className="block text-center font-bold text-[20px]">
        Konfirmasi Barcode
      </span>
      <span className="block pt-2">
        Hasil : <span className="break-words">{dataScan}</span>
      </span>
      <div className="pt-5 grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            scanAgain(false);
          }}
          className="cursor-pointer bg-primary mb-2 rounded-xl p-2 font-medium w-full text-white"
        >
          Konfirmasi
        </button>

        <button
          type="button"
          onClick={() => {
            scanAgain(true);
          }}
          className="bg-background-customer cursor-pointer rounded-xl p-2 font-medium w-full text-primary border border-primary"
        >
          Scan Ulang
        </button>
      </div>
    </div>
  );
}

export default ModalScan;
