import React, { useState } from "react";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import Image from "next/image";
import qrCodeDummy from "@/public/assets/Images/qr-code.png";
import { getFirstTwoWords } from "@/app/_shared/utils";
import { useAppSelector } from "@/app/store/store";
import { FaRegClock } from "react-icons/fa";
import { PiTruck } from "react-icons/pi";
import boxDelivered from "@/public/assets/Icons/box-delivered.svg";
import { useRouter } from "next/navigation";

const DeliveryTracking = () => {
  const [showQR, setShowQR] = useState(false);
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const steps = [
    {
      title: "Pesanan Diterima",
      icon: <FaRegClock className="sm:w-6 sm:h-6 w-5 h-5" />,
      isDone: true,
    },
    {
      title: "Perangkat Dikirim",
      icon: <PiTruck className="sm:w-6 sm:h-6 w-5 h-5" />,
      isDone: false,
    },
    {
      title: "Perangkat Sampai",
      isDone: false,
      icon: (
        <Image
          src={boxDelivered}
          alt="delivered"
          width={24}
          height={24}
          className="sm:w-6 sm:h-6 w-5 h-5 object-contain"
        />
      ),
    },
  ];

  return (
    <div className="flex max-lg:flex-col border border-gray-border justify-between gap-8 lg:gap-16 items-center bg-white rounded-xl max-sm:p-6 py-6 px-8">
      {/* Progress Steps */}
      <div className="flex items-center max-w-2xl w-full max-sm:mb-6 relative">
        {steps.map((step, index) => {
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-12 h-12 max-sm:w-8 max-sm:h-8 flex items-center justify-center rounded-full text-white font-bold text-lg ${
                    step.isDone ? "bg-green-2" : "bg-gray-border"
                  }`}
                >
                  {step.icon}
                </div>

                <div
                  className={`text-center text-sm font-medium sm:whitespace-nowrap text-gray-500 `}
                >
                  {step.title}
                </div>
              </div>

              {/* Connector Line (kecuali setelah step terakhir) */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    step.isDone ? "bg-green-2" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Button Show QR */}
      {steps[2].isDone ? (
        <button
          onClick={() => router.push(`/activation`)}
          className={`${
            userInfo?.status === "active"
              ? "bg-button hover:bg-dark-primary-2 cursor-pointer"
              : "bg-gray-border cursor-not-allowed"
          } max-sm:text-[12px] max-sm:p-2 py-2 px-5 rounded-lg font-medium text-white`}
        >
          Aktivasi Sekarang
        </button>
      ) : (
        <div className="flex-col max-sm:w-full text-end max-lg:text-center">
          <button
            className="py-3 mb-4 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed font-bold max-sm:w-full bg-primary hover:bg-dark-primary-2 text-white rounded-lg cursor-pointer"
            onClick={() => setShowQR(true)}
            disabled={!steps[1].isDone}
          >
            Tunjukkan Kode Booking
          </button>
          <div className="text-xs text-secondary space-y-2">
            <div>
              Kode Booking adalah kode unik untuk proses penerimaan paket
              perangkat CPE (Customer Premises Equipment) dari kurir resmi
              Starlite Indonesia.
            </div>
            <div>
              Simpan dan tunjukkan kode ini saat kurir tiba di lokasi Anda.
            </div>
          </div>
        </div>
      )}

      {/* Modal QR */}
      {showQR && (
        <ModalTemplate
          key="qr-modal"
          closeModal={() => setShowQR(false)}
          classNameModal="p-6 max-w-lg w-full mx-4 text-center rounded-xl shadow-lg"
        >
          <h3 className="text-dark-primary text-2xl font-bold mt-6 mb-4">
            Kode QR Booking
          </h3>

          {/* QR Code */}
          <div className="my-6">
            <Image
              src={qrCodeDummy}
              alt="QR Code"
              className="w-48 h-48 mx-auto"
              width={200}
              height={200}
            />
          </div>

          {/* Nomor Pelanggan */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {getFirstTwoWords(userInfo?.name ?? "Nama Customer")}
            </p>
            <p className="text-lg font-bold text-dark-primary">
              ID Pelanggan: {userInfo?.customer_code ?? "ID Customer"}
            </p>
          </div>

          {/* Button Tutup */}
          <button
            onClick={() => setShowQR(false)}
            className="py-3 cursor-pointer px-6 bg-primary hover:bg-dark-primary-2 text-white rounded-lg w-full font-medium transition"
          >
            Tutup
          </button>
        </ModalTemplate>
      )}
    </div>
  );
};

export default DeliveryTracking;
