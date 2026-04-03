"use client";
import { getPaymentMicrosite } from "@/app/_api/Payment/Payment";
import { getPackageList } from "@/app/_api/Customer/CustomerArea";
import { toastErrorFromAPI, convertToCurrency } from "@/app/_shared/utils";
import PackageCardMobile from "@/app/(routes)/payment/_components/PackageCardMobile";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";

import { useRouter, useSearchParams } from "next/navigation";
import React, { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { LuPackageX } from "react-icons/lu";

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customerId, setCustomerId] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Modal & Package States
  const [openModalConfirm, setOpenModalConfirm] = useState<boolean>(false);
  const [dataPayment, setDataPayment] = useState<any>(null);
  const [loadingPackage, setLoadingPackage] = useState<boolean>(false);
  const [listPackageRegional, setListPackageRegional] = useState<any[]>([]);
  const [choosePackage, setChoosePackage] = useState<string>("");
  const [checkboxModal, setCheckboxModal] = useState<boolean>(false);

  async function getListPackage(fetchedDataPayment: any) {
    setLoadingPackage(true);
    try {
      const res_listPackage = await getPackageList({
        customer_code: fetchedDataPayment?.customer_code,
      });
      const packages = res_listPackage?.data?.data || [];
      setListPackageRegional(packages);

      if (fetchedDataPayment?.regional_package_id?.id) {
        setChoosePackage(fetchedDataPayment.regional_package_id.id);
      } else if (packages.length > 0) {
        setChoosePackage(packages[0].id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat daftar paket");
    } finally {
      setLoadingPackage(false);
    }
  }

  async function paymentBilling(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setErrors({});

    // Jika valid, mulai loading
    setIsLoading(true);
    const loadingToast = toast.loading("Memproses data...");

    try {
      const body = { payload: customerId };
      const res_paymentMicrosite = await getPaymentMicrosite(body);
      const dataPay =
        res_paymentMicrosite.data?.data || res_paymentMicrosite.data;

      const temp = JSON.stringify(dataPay);
      sessionStorage.setItem("dataPayment", temp);
      setDataPayment(dataPay);

      await getListPackage(dataPay);

      setCheckboxModal(false);
      setOpenModalConfirm(true);
    } catch (error: any) {
      toastErrorFromAPI(error);
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  }

  async function nextToPayment() {
    try {
      const pkg = listPackageRegional.find((p) => p.id === choosePackage);
      if (pkg) {
        sessionStorage.setItem("selectedPackage", JSON.stringify(pkg));
      }

      sessionStorage.setItem("customer_id", dataPayment?.customer_code || "");
      router.push("/payment/payment-methods");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Gagal melanjutkan pembayaran",
      );
    }
  }

  return (
    <div className="bg-[url(/assets/Images/hero-ira.webp)] w-full min-h-[70vh] bg-cover bg-center bg-no-repeat flex items-center justify-center px-5 sm:px-10 py-10 relative">
      <div className="max-w-[500px] bg-white/10 backdrop-blur-md p-6 sm:p-10 rounded-2xl shadow-xl w-full mx-auto my-auto z-10">
        <h1 className="text-center text-white text-xl sm:text-2xl font-bold">
          Masukkan nomor pelanggan untuk melakukan pembayaran
        </h1>
        <form onSubmit={paymentBilling} className="mt-8">
          <div>
            <label className="text-white font-medium" htmlFor="customer-id">
              ID Pelanggan / Nomor HP Pelanggan
            </label>
            <input
              name="customer-id"
              id="customer-id"
              type="text"
              disabled={isLoading}
              className={`bg-[#fbfbfb] rounded-xl border text-black w-full py-3 px-5 mt-2 transition-colors focus:outline-none focus:border-blue-500 ${
                errors.customerId ? "border-red-500" : "border-[#D5D5D5]"
              }`}
              placeholder="Masukkan ID / No HP Pelanggan"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
            {errors.customerId && (
              <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-6 py-4 text-white rounded-xl font-bold transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-dark-primary-2 border-2 border-transparent hover:border-white shadow-lg"
            }`}
          >
            {isLoading ? "Loading ..." : "Selanjutnya"}
          </button>
        </form>
      </div>

      {openModalConfirm && (
        <ModalTemplate
          closeModal={() => {
            setOpenModalConfirm(false);
          }}
          classNameModal="max-w-4xl w-[95%] sm:w-11/12 max-h-[90vh] overflow-y-auto bg-white! rounded-2xl"
        >
          <div className="px-5 sm:px-10 py-8">
            <h1 className="text-xl sm:text-3xl font-bold text-center mb-8 pb-4 border-b">
              Konfirmasi Pembayaran
            </h1>

            {/* Data Pelanggan */}
            <div className="mb-8">
              <h2 className="font-bold text-lg sm:text-xl mb-4 text-gray-800">
                Konfirmasi Data Pelanggan
              </h2>
              <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-gray-500 text-sm sm:text-base">
                    ID Pelanggan
                  </div>
                  <div className="col-span-2 font-bold text-sm sm:text-base">
                    : {dataPayment?.customer_code ?? "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-gray-500 text-sm sm:text-base">
                    Nama Lengkap
                  </div>
                  <div className="col-span-2 font-bold text-sm sm:text-base">
                    : {dataPayment?.name ?? "-"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 text-gray-500 text-sm sm:text-base">
                    Nomor Telepon
                  </div>
                  <div className="col-span-2 font-bold text-sm sm:text-base">
                    : {dataPayment?.phone_number ?? "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Pilih Paket */}
            <div className="mb-8">
              <h2 className="font-bold text-lg sm:text-xl mb-4 text-gray-800">
                Silahkan Pilih Paket
              </h2>
              {loadingPackage ? (
                <div className="flex justify-center items-center py-10">
                  <div className="loader-package"></div>
                </div>
              ) : listPackageRegional.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {listPackageRegional.map((item: any) => (
                    <PackageCardMobile
                      key={item.id}
                      pkg={item}
                      selected={choosePackage === item.id}
                      onSelect={(pkg) => setChoosePackage(pkg.id)}
                      convertToCurrency={convertToCurrency}
                    />
                  ))}
                </div>
              ) : (
                <div className="my-10 text-center bg-gray-50 py-10 rounded-xl border border-gray-100">
                  <LuPackageX
                    color="red"
                    className="w-16 h-16 mx-auto mb-3 opacity-80"
                  />
                  <p className="text-red-500 text-lg font-bold">
                    Tidak Ada Paket Tersedia
                  </p>
                </div>
              )}
            </div>

            {/* Checkbox Konfirmasi */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 mb-8">
              <p className="text-gray-600 text-sm sm:text-base mb-3 font-medium">
                Jika semua data sudah benar, silakan lanjutkan proses
                pembayaran.
              </p>
              <div className="flex gap-3 items-center">
                <input
                  id="checkbox-confirm"
                  type="checkbox"
                  onChange={() => setCheckboxModal(!checkboxModal)}
                  className="w-[22px] h-[22px] accent-primary cursor-pointer"
                  checked={checkboxModal}
                />
                <label
                  htmlFor="checkbox-confirm"
                  className="p-0 m-0 cursor-pointer text-sm sm:text-base font-bold text-gray-800 select-none"
                >
                  Ya, data pelanggan sudah benar
                </label>
              </div>
            </div>

            {/* Button Lanjut */}
            <div className="">
              <button
                disabled={!checkboxModal || !choosePackage}
                className={`w-full text-center py-4 transition-all shadow-md ${
                  checkboxModal && choosePackage
                    ? "bg-primary hover:bg-dark-primary-2 cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed opacity-70"
                } text-white font-bold px-3 text-base sm:text-xl rounded-xl`}
                onClick={nextToPayment}
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        </ModalTemplate>
      )}
    </div>
  );
}

export default Page;
