import React, { useEffect, useState } from "react";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import Image from "next/image";
import qrCodeDummy from "@/public/assets/Images/qr-code.png";
import {
  copyToClipboard,
  getFirstTwoWords,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import { useAppSelector } from "@/app/store/store";
import { FaRegClock, FaRegCopy } from "react-icons/fa";
import { PiTruck } from "react-icons/pi";
import boxDelivered from "@/public/assets/Icons/box-delivered.svg";
import { useRouter } from "next/navigation";
import { getShipment } from "@/app/_api/Shipment/Shipment";
import { Shipment } from "@/app/_shared/data/shipment";
import { BsExclamationTriangle } from "react-icons/bs";
import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
import Link from "next/link";
import ActivationScan from "@/public/assets/Images/scan-activation.png";
import SignalArc from "../../activation/_components/SignalWave";
import CPEIRA from "@/public/assets/Images/cpe-ira.png";

const DeliveryTracking = ({
  data,
  refetch,
}: {
  data: SubscriptionHistoryAPI | undefined;
  refetch: () => Promise<void>;
}) => {
  const router = useRouter();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [packageData, setPackageData] = useState<Shipment>();
  const { userInfo, isLoggedIn, shipmentStatus } = useAppSelector(
    (state) => state.auth
  );

  type ShipmentStatus = "waiting" | "assigned" | "done" | "unknown";

  const [shipmentStatusData, setShipmentStatusData] = useState<ShipmentStatus>(
    (data?.shipment_status as ShipmentStatus) ?? "waiting"
  );

  const rankMap: Record<ShipmentStatus, number> = {
    waiting: 0,
    assigned: 1,
    done: 2,
    unknown: -1,
  };
  const currentRank = rankMap[shipmentStatusData];

  useEffect(() => {
    if (data?.shipment_status !== shipmentStatusData) {
      setShipmentStatusData(data?.shipment_status as ShipmentStatus);
    }
  }, [data?.shipment_status, shipmentStatusData]);

  useEffect(() => {
    if (data?.shipment_status === "assigned") {
      const intervalId = setInterval(() => {
        refetch();
        // console.log("status shipment refetched");
      }, 20000);

      return () => clearInterval(intervalId);
    }
  }, [data?.shipment_status, refetch]);

  const stepDefs = [
    {
      title: "Pesanan Dalam Antrian",
      icon: <FaRegClock className="sm:w-6 sm:h-6 w-5 h-5" />,
    },
    {
      title: "Perangkat Dikirim",
      icon: <PiTruck className="sm:w-6 sm:h-6 w-5 h-5" />,
    },
    {
      title: "Perangkat Sampai",
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

  // isDone: step dianggap selesai jika rank status saat ini >= index step
  const steps = stepDefs.map((s, idx) => ({
    ...s,
    isDone: currentRank >= idx,
  }));

  const fetchData = async () => {
    try {
      const res: any = await getShipment({});
      if (res?.data?.statusCode === 200) {
        setPackageData(res.data?.data);
      }
    } catch (error: any) {
      toastErrorFromAPI(error);
    } finally {
    }
  };

  useEffect(() => {
    if (data?.shipment_status === "assigned") fetchData();
  }, [data?.shipment_status]);

  if (shipmentStatusData === "unknown") {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex max-lg:flex-col border border-gray-border justify-between gap-6 lg:gap-16 items-center bg-white rounded-xl max-sm:p-6 py-6 px-8">
        {/* Progress Steps */}
        <div className="flex items-center max-w-2xl w-full relative">
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

        {/* Button Show Modal */}
        {currentRank === 2 ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowActivationModal(true)}
              className="bg-button hover:bg-dark-primary-2 cursor-pointer max-sm:text-[12px] max-sm:p-2 py-2 px-5 rounded-lg font-medium text-white"
            >
              Aktivasi Perangkat
            </button>
          </div>
        ) : (
          <div className="flex-col max-sm:w-full text-end max-lg:text-center">
            <button
              className="py-3 mb-4 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed font-bold max-sm:w-full bg-primary hover:bg-dark-primary-2 text-white rounded-lg cursor-pointer"
              onClick={() => setShowQRModal(true)}
              disabled={!steps[1].isDone}
            >
              Tunjukkan Kode Booking
            </button>
            <div className="text-xs text-secondary space-y-2">
              <div>
                Kode Booking adalah kode unik untuk proses penerimaan paket
                perangkat CPE (Customer Premises Equipment) dari Sales resmi
                Internet Rakyat.
              </div>
              <div>
                Simpan dan tunjukkan kode ini saat Sales tiba di lokasi Anda.
              </div>
            </div>
          </div>
        )}

        {/* Modal QR */}
        {showQRModal && (
          <ModalTemplate
            key="qr-modal"
            closeModal={() => {
              setShowQRModal(false);
              refetch();
              // window.location.reload();
            }}
            classNameModal="p-6 max-w-2xl overflow w-full max-sm:mx-4 text-center rounded-xl shadow-lg"
          >
            <h3 className="text-black text-2xl font-bold mb-4">
              Kode QR Booking
            </h3>

            {/* QR Code */}
            <div className="my-6 flex justify-center">
              <Image
                src={`${process.env.NEXT_PUBLIC_URL_OBS}${packageData?.code_url}`}
                alt="QR Code"
                width={256}
                height={256}
                className="w-64 h-64 object-contain"
                // unoptimized
              />
            </div>

            {/* Nomor Pelanggan */}
            <div className="mb-6">
              <p className="text-base mb-2 text-gray-600">
                {getFirstTwoWords(
                  packageData?.customer_id.name ?? "Nama Customer"
                )}{" "}
                - {packageData?.customer_id.customer_code ?? "ID Customer"}
              </p>
              <p className="text-lg font-bold text-dark-primary">
                Kode Shipment: {packageData?.code ?? "ID Shipment"}
              </p>
            </div>

            {/* Button Tutup */}
            <button
              onClick={() =>
                copyToClipboard(packageData?.code ?? "ID Shipment")
              }
              className="py-3 flex justify-center items-center gap-2 cursor-pointer px-6 bg-primary hover:bg-dark-primary-2 text-white rounded-lg w-full font-medium transition"
            >
              <FaRegCopy /> Salin Kode
            </button>

            <div className="my-5 border border-b border-gray-border"></div>

            <div className="w-full flex justify-center gap-4 items-center py-3 px-4 bg-[#FEFCE8] border border-[#A16207] rounded-lg text-sm text-[#A16207]">
              <BsExclamationTriangle size={38} />
              <p className="text-start">
                Tips Keamanan: Jangan bagikan Kode Booking ke pihak lain selain
                Sales resmi atau wali penerima yang Anda tunjuk.
              </p>
            </div>

            {/* Informasi Kode Booking */}
            <div className="my-6 text-start">
              <h4 className="text-lg font-semibold text-dark-primary mb-3">
                Informasi Kode Booking
              </h4>

              <ol className="list-decimal list-inside space-y-2 text-sm text-black">
                <li>
                  <span className="font-medium">Kode Booking</span> bersifat
                  rahasia dan hanya digunakan untuk verifikasi penerima paket.
                </li>
                <li>
                  Kode ini dapat disimpan dan diberikan kepada wali penerima
                  paket jika penerima utama tidak dapat menerima langsung.
                </li>
                <li>
                  Jika <span className="font-medium">Kode Booking</span> hilang
                  atau lupa, Anda dapat:
                  <ul className="list-disc list-inside mt-1 ml-4 space-y-1">
                    <li>
                      Mengecek kembali melalui halaman resmi{" "}
                      <Link
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        IRA Internet Rakyat
                      </Link>{" "}
                      dengan login menggunakan nomor yang terdaftar.
                    </li>
                    <li>
                      Meminta sales untuk mengirimkan ulang{" "}
                      <span className="font-medium">Kode Booking</span> Anda.
                    </li>
                  </ul>
                </li>
              </ol>
            </div>
          </ModalTemplate>
        )}

        {/* Modal Activation */}
        {showActivationModal && (
          <ModalTemplate
            key="activation-modal"
            closeModal={() => {
              setShowActivationModal(false);
            }}
            classNameModal="p-6 max-w-3xl overflow w-full max-sm:mx-4 text-center rounded-xl shadow-lg"
          >
            <div className="my-6 flex justify-center">
              <Image
                src={ActivationScan}
                alt="Activation Icon"
                className="sm:w-64 sm:h-64 w-32 h-32 object-contain"
                // unoptimized
              />
            </div>

            <h3 className="text-black sm:text-2xl text-xl font-bold mb-4">
              Aktivasi Perangkat (CPE)
            </h3>

            <p className="sm:text-base text-start text-xs sm:px-8">
              Biar proses aktivasi kamu lancar tanpa kendala, yuk pastikan
              perangkat CPE-nya sudah dalam kondisi siap digunakan. Cek dulu
              beberapa hal penting berikut ya:
            </p>

            {/* Tutorial, your code here */}
            <div className="my-6 sm:px-8 text-start">
              <div className="space-y-4">
                {/* Langkah 1 */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-primary text-white rounded-full min-w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-primary">
                      CPE sudah dicolok ke listrik
                    </p>
                    <p className="text-sm text-black mt-1">
                      Pastikan adaptor terpasang dengan benar dan colokan
                      listrik dalam kondisi aktif.
                    </p>
                  </div>
                </div>

                {/* Langkah 2 */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="bg-primary text-white rounded-full min-w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-primary">
                      Lampu indikator pada CPE sudah menyala
                    </p>
                    <p className="text-sm text-black mt-1">
                      Lampu yang menyala menandakan perangkat sudah aktif dan
                      siap diproses untuk aktivasi.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="my-6 py-3 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed font-bold max-sm:w-full bg-primary hover:bg-dark-primary-2 text-white sm:rounded-lg rounded-full cursor-pointer"
              onClick={() => {
                router.push(`/activation`);
                // router.push(`/activation/activating-cpe`); // manual activation page
              }}
            >
              Mulai Aktivasi Perangkat
            </button>
          </ModalTemplate>
        )}
      </div>

      <div className="border border-gray-border items-center bg-white rounded-xl">
        {currentRank === 2 && (
          <div>
            <div className="text-center pt-4 text-lg font-bold">
              Perangkat Siap Diaktivasi
            </div>
            <div className="relative w-full flex justify-center">
              <div className="relative w-70 sm:w-90 h-35 sm:h-42.5 flex items-center justify-center">
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                  <SignalArc isLeft />
                </div>

                <div className="relative z-10 flex items-center justify-center">
                  <Image
                    src={CPEIRA}
                    alt="Activating CPE"
                    className="w-[110px] sm:w-[140px] object-contain drop-shadow-md"
                  />
                </div>

                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <SignalArc isLeft={false} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
