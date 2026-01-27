import { paymentList } from "@/app/_shared/data/data";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function ModalPayment({
  setPayment,
  closeModal,
}: {
  setPayment: (e: any) => void;
  closeModal(): void;
}) {
  const [choosePayment, setChoosePayment] = useState<any>(null);

  // useEffect(() => {
  //   console.log(choosePayment);
  // }, [choosePayment]);

  return (
    <div>
      {paymentList.map((item: any) => {
        return (
          <div key={"payment-" + item.id} className="mb-6">
            <h1 className="font-semibold mb-5">{item.name}</h1>
            <div className="grid grid-cols-3 gap-2.5">
              {item.bankList.map((bank: any) => {
                return (
                  <div
                    key={item.name + "-" + bank.name}
                    className={`w-full h-[80px] rounded-lg flex items-center justify-center box-shadow-choose-payment cursor-pointer ${
                      choosePayment?.name === bank.name &&
                      "border border-primary"
                    }`}
                    onClick={() => {
                      setChoosePayment(bank);
                    }}
                  >
                    <Image
                      alt="bank"
                      src={bank.icon}
                      width={1920}
                      height={1080}
                      className="w-2/5"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        className="w-full mt-8 bg-primary text-white py-[15px] rounded-lg font-bold cursor-pointer"
        onClick={() => {
          setPayment(choosePayment);
          closeModal();
        }}
      >
        Pilih
      </button>
    </div>
  );
}

export default ModalPayment;
