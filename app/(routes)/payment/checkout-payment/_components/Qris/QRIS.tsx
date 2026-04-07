import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import checkoutQris from "@/public/assets/checkout-payment/checkout-qris.png";
import Image from "next/image";
import Lottie from "lottie-react";
import successAnimation from "@/public/assets/Icons/SuccessAnimation.json";
import failedAnimation from "@/public/assets/Icons/FailedAnimation.json";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { formatDate, toastErrorFromAPI } from "@/app/_shared/utils";
import { getPaymentStatus } from "@/app/_api/Payment/Payment";
import { UnifiedPaymentData } from "@/app/_shared/types/payment";
import QRCode from "qrcode";
import iraLogo from "@/public/assets/Images/LogoIra.png";
import { LuDownload } from "react-icons/lu";
import { getPaymentStatusMicrosite } from "@/app/_api/Payment/Payment-Microsite";
import { useAppSelector } from "@/app/store/store";

function QRIS({ data }: { data: UnifiedPaymentData }) {
  const router = useRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [checkOutUrl, setCheckOutUrl] = useState<string | null>(null);

  const { userInfo } = useAppSelector((state) => state.auth);

  const generateQR = useCallback(async () => {
    if (!data?.qr_checkout_string) return;
    try {
      const url = QRCode.toDataURL(data?.qr_checkout_string, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(await url);
    } catch (err) {
      console.error("Gagal generate QR:", err);
    }
  }, [data?.qr_checkout_string]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const checkPaymentStatus = async () => {
    setIsLoadingStatus(true);

    try {
      const customerId = sessionStorage.getItem("customer_id");
      const params = {
        customer_code: customerId,
      };
      const res_status = userInfo
        ? await getPaymentStatus(params)
        : await getPaymentStatusMicrosite(params);
      const isPaid = res_status?.data?.data;

      // Non-login + success → halaman khusus (bukan modal)
      if (!userInfo && isPaid === true) {
        const selectedPkg = JSON.parse(sessionStorage.getItem("selectedPackage") || "{}");
        const selectedMethod = JSON.parse(sessionStorage.getItem("selectedPaymentMethod") || "{}");
        sessionStorage.setItem("paymentSuccessData", JSON.stringify({
          invoiceRef: data.reference_id || data.payment_attempt?.reference_id || data.id || "-",
          customerId: customerId || data.customer_id?.customer_code || "-",
          description: selectedPkg?.name || data.package_id?.name || "-",
          paidAt: new Date().toISOString(),
          paymentMethod: selectedMethod?.name || data.channel_payment_id?.name || data.channel_code || "-",
          amount: Number(data.amount) || selectedPkg?.price || 0,
        }));
        router.push("/payment-billing/success");
        return;
      }

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
            {qrDataUrl && (
              <Image
                src={qrDataUrl}
                alt="QRIS"
                width={256}
                height={256}
                className="w-full h-full object-contain relative z-10"
              />
            )}

            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-white rounded-full p-2 shadow-md">
                <Image
                  src={iraLogo} // Sesuaikan path logo IRA
                  alt="IRA Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
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
            className="group cursor-pointer flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-white border-2 border-primary text-primary font-bold hover:bg-red-50 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <LuDownload className="w-4 h-4 hover:animate-bounce" />
            Download QR Code
          </button>

          {data?.expires_at && (
            <div className="flex justify-between gap-2 w-full pt-3 max-sm:text-sm text-primary">
              <div className="">Bayar Sebelum</div>
              <div className="text-right font-medium">
                {formatDate(data?.expires_at)}
              </div>
            </div>
          )}
        </div>

        {/* <button
          type="button"
          onClick={handleOpenCheckoutUrl}
          className="bg-primary mt-6 hover:bg-dark-primary-2 cursor-pointer rounded-full sm:rounded-lg font-bold text-white w-full text-sm sm:text-xl py-4"
        >
          Atau Bayar Disini
        </button> */}
      </div>

      <div className="text-center my-6">
        <button
          type="button"
          onClick={checkPaymentStatus}
          disabled={isLoadingStatus}
          className="bg-primary hover:bg-dark-primary-2 text-white disabled:cursor-not-allowed! cursor-pointer sm:mt-10 mt-3 rounded-full font-bold w-full max-sm:text-sm py-3"
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
              <h2 className="text-xl font-bold text-green-600 mb-2 mt-10 sm:mt-3">
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
              <h2 className="text-xl font-bold text-red-600 mb-2 mt-10 sm:mt-3">
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
