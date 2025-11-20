"use client";
import { packageList } from "@/app/_shared/data/data";
import React, { useEffect, useState } from "react";
import PackageCard from "./_components/PackageCard";
import Image from "next/image";

import modemImage from "@/public/assets/Images/main-modem.svg";
import { convertToCurrency } from "@/app/_shared/utils";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import ModalPayment from "./_components/ModalPayment";

function Page() {
  const [choosePackage, setChoosePackage] = useState<string>("");
  const [choosePayment, setChoosePayment] = useState<any>(null);

  const [detailChoosePackage, setDetailChoosePackage] = useState<any>(null);

  const [modalPayment, setModalPayment] = useState<boolean>(false);

  useEffect(() => {
    setDetailChoosePackage(
      packageList.find((item: any) => item.id.toString() === choosePackage)
    );
  }, [choosePackage]);

  return (
    <div>
      <div className="container mx-auto px-5 mt-22">
        <h1 className="text-[32px] font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-3 gap-10">
          {/* List Package */}
          <div className="col-span-1">
            <h2 className="text-xl font-bold">Pilih Paket</h2>
            <div className="mt-5">
              {packageList.map((item: any, index: number) => {
                return (
                  <div
                    key={"package-" + index}
                    className="mb-5 cursor-pointer"
                    onClick={() => setChoosePackage(item.id.toString())}
                  >
                    <PackageCard
                      paket={item}
                      isActive={choosePackage === item.id.toString()}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Package */}
          <div className="col-span-2">
            <h2 className="text-xl font-bold">Detail Paket</h2>

            {choosePackage === "" ? (
              <p className="text-lg mt-5">
                Silahkan pilih paket terlebih dahulu
              </p>
            ) : (
              <div>
                {/* Detail Paket */}
                <div className="grid grid-cols-3 gap-10 mt-5 items-center">
                  <div className="col-span-1">
                    <Image
                      alt="modem"
                      src={modemImage}
                      className="w-3/4 mx-auto"
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-lg ">{detailChoosePackage?.name}</p>
                    <p className="mt-1">
                      <span className="font-black text-3xl">
                        {convertToCurrency(detailChoosePackage?.price)}
                      </span>{" "}
                      / berlaku {detailChoosePackage?.period} Hari
                    </p>
                    <p className="mt-10">Termasuk: </p>
                    <ul className="list-disc list-inside">
                      <li>1x Modem</li>
                      <li>1x Box</li>
                      <li>1x Buku Panduan</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[#A7A7A7] w-full h-px my-10" />

                {/* Metode Pembayaran */}
                <h2 className="text-lg font-bold">Metode Pembayaran</h2>

                <div className="flex justify-between items-center gap-10 mt-5">
                  <p>Virtual Account</p>

                  <div className="py-5 px-11 border border-primary shadow-2xl rounded-lg">
                    {choosePayment ? (
                      <Image
                        alt="payment"
                        src={choosePayment?.icon}
                        className=""
                      />
                    ) : (
                      <p className="text-sm font-bold">
                        Pilih Metode Pembayaran
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setModalPayment(true)}
                  className="w-full bg-primary text-white py-3 rounded-lg mt-10 cursor-pointer"
                >
                  Ganti Metode Pembayaran
                </button>

                <div className="bg-[#A7A7A7] w-full h-[1px] my-10" />

                {/* Rincian Pembayaran */}
                <h2 className="text-xl font-bold">Rincian Pembayaran</h2>

                <div className="flex justify-between items-center gap-10 mt-5">
                  <p>Harga Produk</p>
                  <p>{convertToCurrency(detailChoosePackage?.price)}</p>
                </div>
                <div className="flex justify-between items-center gap-10 mt-5">
                  <p>Harga Pengiriman</p>
                  <p>{convertToCurrency(14000)}</p>
                </div>
                <div className="flex justify-between items-center gap-10 mt-5">
                  <p>Biaya Bank</p>
                  <p>{convertToCurrency(7000)}</p>
                </div>
                <div className="bg-[#A7A7A7] w-full h-[1px] my-3" />
                <div className="flex justify-between items-center gap-10 mt-5">
                  <p className="text-lg font-bold ">Total Pembayaran</p>
                  <p className="text-lg font-bold ">
                    {convertToCurrency(
                      detailChoosePackage?.price + 14000 + 7000
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* footer checkout */}
      <div className=" py-5 box-shadow-checkout-payment mt-40">
        <div className="container mx-auto px-5">
          <div className="grid grid-cols-2 gap-10">
            <div className="col-span-1">
              <p>Total Pembayaran</p>
              <p>
                <span className="text-3xl font-black">
                  {convertToCurrency(detailChoosePackage?.price + 14000 + 7000)}
                </span>{" "}
                sudah termasuk pajak
              </p>
            </div>
            <div className="col-span-1 flex justify-end items-center">
              <button className="text-lg font-bold text-white bg-primary py-[15px] px-20 rounded-xl w-1/2">
                Bayar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      {modalPayment && (
        <ModalTemplate
          closeModal={() => setModalPayment(false)}
          classNameModal="w-1/2 p-7"
        >
          <ModalPayment
            setPayment={(val: any) => setChoosePayment(val)}
            closeModal={() => setModalPayment(false)}
          />
        </ModalTemplate>
      )}
    </div>
  );
}

export default Page;
