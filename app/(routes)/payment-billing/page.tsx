"use client";
import { getPaymentMicrosite } from "@/app/_api/Payment/Payment";
import { toastErrorFromAPI } from "@/app/_shared/utils";
import FloatingNavbar from "@/app/_components/FloatingNavbar";
import { dmSans } from "@/app/_shared/font/font";
import { useRouter } from "next/navigation";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { getPackageListMicrosite } from "@/app/_api/Payment/Payment-Microsite";
import Image from "next/image";
import personPayment from "@/public/assets/Images/person-payment-1.webp";

function Page() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [showId, setShowId] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  async function getListPackage(fetchedDataPayment: any) {
    try {
      const res_listPackage = await getPackageListMicrosite({
        customer_code: fetchedDataPayment?.customer_code,
      });
      const packages = res_listPackage?.data?.data || [];
      sessionStorage.setItem("listPackage", JSON.stringify(packages));

      // Simpan default selectedPackage sebagai full object (sama dengan flow payment biasa)
      const defaultPkg = fetchedDataPayment?.regional_package_id
        ? packages.find(
            (p: any) => p.id === fetchedDataPayment.regional_package_id.id,
          )
        : packages[0];

      if (defaultPkg) {
        sessionStorage.setItem("selectedPackage", JSON.stringify(defaultPkg));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat daftar paket");
    }
  }

  async function paymentBilling(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const body = { payload: customerId };
      const res_paymentMicrosite = await getPaymentMicrosite(body);
      const dataPay =
        res_paymentMicrosite.data?.data || res_paymentMicrosite.data;

      sessionStorage.setItem("dataPayment", JSON.stringify(dataPay));
      sessionStorage.setItem("customer_id", dataPay?.customer_code || "");

      await getListPackage(dataPay);

      router.push("/payment-billing/confirmation");
    } catch (error: any) {
      toastErrorFromAPI(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={`bg-white min-h-screen w-full relative overflow-x-hidden ${dmSans.className}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-screen sm:h-[65vh] bg-cover bg-right bg-no-repeat"
        style={{ backgroundImage: "url('/assets/Images/bg-register.png')" }}
      />

      <div className="relative z-10">
        <FloatingNavbar />

        <div className="px-4 md:px-6 pt-28 md:pt-48 pb-10">
          <div className="w-full max-w-[1200px] mx-auto">
            <div className="w-full rounded-3xl md:rounded-[40px] bg-[#a80f0f] shadow-[0_20px_60px_rgba(164,18,18,0.4)] overflow-visible relative flex flex-col lg:flex-row min-h-[500px] border-2 border-white mb-10">
              {/* Person image */}
              <div
                className="w-full lg:w-[45%] relative flex justify-center items-end min-h-[250px] md:min-h-[320px] lg:min-h-[500px] max-lg:mt-20"
                style={{ clipPath: "inset(-200% -200% 0 -200%)" }}
              >
                <div className="absolute inset-x-0 bottom-0 w-full flex justify-center lg:justify-end items-end h-full z-30 pointer-events-none">
                  <Image
                    src={personPayment}
                    alt="Payment IRA"
                    fill
                    className="object-contain object-bottom scale-125 lg:scale-110 transform origin-bottom lg:translate-x-[-10px] lg:translate-y-[20px] xl:translate-x-[-15px] xl:translate-y-[24px] drop-shadow-[5px_0_15px_rgba(0,0,0,0.5)]"
                    priority
                  />
                </div>
              </div>

              {/* Form card */}
              <div className="w-full max-sm:mt-[-25%] lg:w-[60%] xl:w-[58%] flex justify-center items-start p-6 max-lg:pt-0 z-25 relative">
                <div className="bg-white rounded-[24px] md:rounded-[32px] w-full min-h-[400px] shadow-2xl p-6 sm:p-8 flex flex-col justify-center relative border border-white/50">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm hover:text-primary mb-6 w-fit transition-colors"
                  >
                    ← Kembali
                  </button>

                  <h1 className="text-2xl text-center font-bold text-old-primary mb-3">
                    Pembayaran Manual
                  </h1>
                  <p className="text-sm text-center  mb-6">
                    Masukkan nomor pelanggan untuk melakukan pembayaran
                  </p>

                  <form onSubmit={paymentBilling}>
                    <div>
                      <label
                        className="text-gray-500 text-sm font-medium"
                        htmlFor="customer-id"
                      >
                        Nomor Pelanggan / Nomor Telepon Pelanggan
                      </label>
                      <div className="relative mt-2">
                        <input
                          name="customer-id"
                          id="customer-id"
                          type="text"
                          autoComplete="off"
                          disabled={isLoading}
                          style={
                            !showId
                              ? ({
                                  WebkitTextSecurity: "disc",
                                } as React.CSSProperties)
                              : undefined
                          }
                          className={`bg-[#fbfbfb] rounded-xl border text-black w-full py-3 px-4 pr-12 transition-colors focus:outline-none focus:border-primary ${
                            errors.customerId
                              ? "border-red-500"
                              : "border-[#D5D5D5]"
                          }`}
                          placeholder="+62 899-9292-9929"
                          value={customerId}
                          onChange={(e) => setCustomerId(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowId(!showId)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showId ? (
                            <IoEyeOffOutline size={20} />
                          ) : (
                            <IoEyeOutline size={20} />
                          )}
                        </button>
                      </div>
                      {errors.customerId && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.customerId}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full mt-6 py-4 text-white rounded-xl font-bold transition-colors ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-primary hover:bg-dark-primary-2"
                      }`}
                    >
                      {isLoading ? "Loading..." : "Lanjut ke Pembayaran"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
