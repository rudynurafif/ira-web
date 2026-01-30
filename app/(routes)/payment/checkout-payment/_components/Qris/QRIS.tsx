import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import checkoutQris from "@/public/assets/checkout-payment/checkout-qris.png";
import Image from "next/image";
import Lottie from "lottie-react";
import successAnimation from "@/public/assets/Icons/SuccessAnimation.json";
import failedAnimation from "@/public/assets/Icons/FailedAnimation.json";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import { getPaymentStatus } from "@/app/_api/Payment/Payment";
import { QRISPaymentData } from "@/app/_shared/types/payment";
import QRCode from "qrcode";
import iraLogo from "@/public/assets/Images/LogoIra.png";
import { LuDownload } from "react-icons/lu";

function QRIS({ data }: { data: QRISPaymentData }) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [checkOutUrl, setCheckOutUrl] = useState<string | null>(null);

  const generateQR = useCallback(async () => {
    if (!data.qr_checkout_string) return;
    try {
      const url = await QRCode.toDataURL(data.qr_checkout_string, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error("Gagal generate QR:", err);
    }
  }, [data.qr_checkout_string]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const checkPaymentStatus = async () => {
    setIsLoadingStatus(true);

    try {
      const res_status = await getPaymentStatus();
      const isPaid = res_status?.data?.data;

      setPaymentStatus(isPaid);
      setShowResultModal(true);
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleOpenCheckoutUrl = () => {
    const url =
      data.desktop_web_checkout_url ??
      data.mobile_web_checkout_url ??
      data.qr_checkout_string ??
      data.mobile_deeplink_checkout_url ??
      undefined;

    setCheckOutUrl(url ?? null);

    if (url) {
      router.push(url);
      // window.location.href = url;
    }
  };

  const closeModal = () => {
    setShowResultModal(false);
    if (paymentStatus === true) {
      router.push("/customer-area");
    }
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;

    // Buat elemen <a> secara dinamis
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${data?.xendit_event_id}-qris-payment.png`; // Nama file saat diunduh
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mt-4 w-full bg-[#F7F9FD] border border-[#949AA3] rounded-xl p-5">
        <div className="flex flex-col gap-4 justify-center items-center">
          {/* QR Code Container */}
          <div className="relative w-64 h-64 bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            {/* QR Code */}
            <Image
              src={qrDataUrl}
              alt="QRIS"
              width={256}
              height={256}
              className="w-full h-full object-contain relative z-10"
            />

            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-white rounded-full p-2 shadow-md">
                <Image
                  src={iraLogo} // Sesuaikan path logo IRA
                  alt="IRA Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Label QR Code */}
          <div className="text-center">
            <p className="text-gray-600 text-lg">
              Scan untuk pembayaran via QRIS
            </p>
          </div>

          {/* Tombol Download */}
          <button
            type="button"
            onClick={downloadQRCode}
            className="group cursor-pointer flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-white border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <LuDownload className="w-4 h-4 hover:animate-bounce" />
            Download QR Code
          </button>
        </div>

        {/* <button
          type="button"
          onClick={handleOpenCheckoutUrl}
          className="bg-primary mt-6 hover:bg-dark-primary-2 cursor-pointer rounded-full sm:rounded-lg font-bold text-white w-full text-sm sm:text-xl py-4"
        >
          Atau Bayar Disini
        </button> */}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={checkPaymentStatus}
          disabled={isLoadingStatus}
          className="bg-white hover:bg-red-50 border-2 border-primary text-primary disabled:cursor-not-allowed! cursor-pointer sm:mt-10 mt-3 rounded-lg font-bold w-full max-sm:text-sm py-3"
        >
          {isLoadingStatus ? "Sedang mengecek.." : "Cek Status Pembayaran"}
        </button>
      </div>

      {showResultModal && paymentStatus !== null && (
        <ModalTemplate
          closeModal={closeModal}
          classNameModal="max-w-md p-6 text-center"
        >
          {paymentStatus ? (
            <>
              <h2 className="text-xl font-bold text-green-600 mb-2 mt-3">
                Pembayaran Berhasil! 🎉
              </h2>
              <div className="flex justify-center my-4">
                <Lottie
                  animationData={successAnimation}
                  className="w-40 h-40"
                />
              </div>
              <p className="text-gray-700">
                Terima kasih! Paket langganan Anda telah aktif.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-red-600 mb-2 mt-3">
                Pembayaran Belum Berhasil
              </h2>
              <div className="flex justify-center my-4">
                <Lottie animationData={failedAnimation} className="w-40 h-40" />
              </div>
              <p className="text-gray-700">
                Silakan lakukan pembayaran terlebih dahulu.
              </p>
            </>
          )}
          <button
            onClick={closeModal}
            className="mt-4 cursor-pointer px-6 py-2 bg-primary hover:bg-dark-primary-2 text-white rounded-lg"
          >
            Tutup
          </button>
        </ModalTemplate>
      )}
    </div>
  );
}

export default QRIS;
