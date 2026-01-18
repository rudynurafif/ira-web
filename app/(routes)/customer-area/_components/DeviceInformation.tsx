import Image from "next/image";
import React, { useEffect, useState } from "react";

import { FaRegEdit } from "react-icons/fa";
import EditSSIDModal from "./Modal/EditSSIDModal";
import {
  getSignalLevel,
  maskPassword,
  toastErrorFromAPI,
} from "@/app/_shared/utils";
import {
  getDetailCPE,
  getSignal,
  getSSID,
  setSSID,
} from "@/app/_api/CoreNetwork/CoreNetwork";
import { listConnectedDevices } from "@/app/_shared/data/data";
import { CpeSimBinding, SetSSIDBody } from "@/app/_shared/types/CoreNetwork";
// import { useSSE } from "@/app/_context/SSEContext";
import { useSSEOneTime } from "@/app/hooks/useSSEOneTime";
import { getCookie } from "cookies-next";
import { decodeJwt } from "@/app/_shared/utils";
import { DecodedToken } from "@/app/_context/sse.type";
import SignalStatus from "./SignalStatus";
import toast from "react-hot-toast";

const SIGNAL_STORAGE_KEY = "ira-cpe-signal-data";

const saveSignalToSession = (data: any) => {
  try {
    sessionStorage.setItem(SIGNAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Gagal simpan signal ke sessionStorage", e);
  }
};

const loadSignalFromSession = () => {
  try {
    const raw = sessionStorage.getItem(SIGNAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        (typeof parsed.rsrp === "number" &&
          typeof parsed.rsrq === "number" &&
          typeof parsed.sinr === "number") ||
        parsed.level === "disconnected"
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Gagal baca signal dari sessionStorage", e);
  }
  return null;
};

const DeviceInformation = () => {
  const [signalData, setSignalData] = useState<{
    rsrp: number | null;
    rsrq: number | null;
    sinr: number | null;
    cell_id: string | null;
    level: "verygood" | "good" | "poor" | "bad" | "disconnected";
    message: string | null;
  }>({
    rsrp: null,
    rsrq: null,
    sinr: null,
    cell_id: null,
    level: "disconnected",
    message: null,
  });

  const [connectedDevices, setConnectedDevices] =
    useState(listConnectedDevices);
  const [isLoadingSignal, setIsLoadingSignal] = useState(true);
  const [serialNumber, setSerialNumber] = useState<string | null>(null);
  const [cpeDetail, setCpeDetail] = useState<CpeSimBinding | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSSID, setEditingSSID] = useState({
    type: "2.4 Ghz" as "2.4 Ghz" | "5 Ghz",
    ssid: "WiFi Rumah",
    password: "katasandi123",
  });
  const token = getCookie("token-ira");
  const decodedToken = token
    ? (decodeJwt(token as string) as DecodedToken)
    : null;
  const customer_id = decodedToken?.customer_id;
  const [isWaitingForSignal, setIsWaitingForSignal] = useState(false);
  const [isWaitingForWifi, setIsWaitingForWifi] = useState(false);
  const [isWaitingForSetWifi, setIsWaitingForSetWifi] = useState(false);
  const isSaving = isWaitingForSetWifi;

  // 🔥 Dengarkan SSE hanya saat menunggu sinyal
  useSSEOneTime(
    customer_id || "",
    (payload) => {
      const { rsrp, rsrq, sinr, cell_id } = payload.data || {};
      const message = payload.message || null;
      let newSignalData;

      if (
        payload.message === "Success" &&
        typeof rsrp === "number" &&
        typeof rsrq === "number" &&
        typeof sinr === "number" &&
        typeof cell_id === "string"
      ) {
        const level = getSignalLevel(rsrp, rsrq, sinr);
        newSignalData = {
          rsrp,
          rsrq,
          sinr,
          cell_id,
          level,
          message: message,
        };
        saveSignalToSession(newSignalData);
      } else {
        newSignalData = {
          rsrp: null,
          rsrq: null,
          sinr: null,
          cell_id: null,
          level: "disconnected" as const,
          message: message || "Device tidak merespon",
        };
      }
      setSignalData(newSignalData);
      setIsLoadingSignal(false);
      setIsWaitingForSignal(false);
    },
    isWaitingForSignal,
    (payload) => payload.type === "get_signal",
    undefined,
    () => {
      setIsLoadingSignal(false);
      setIsWaitingForSignal(false);
      toast.error("Gagal mendapatkan sinyal. Coba lagi.");
    }
  );

  // 🔥 Dengarkan SSE untuk get_wifi
  useSSEOneTime(
    customer_id || "",
    (payload) => {
      // Perbarui state cpeDetail dengan data dari SSE
      setCpeDetail((prev) => {
        if (!prev || !prev.cpe_id) return prev;
        return {
          ...prev,
          cpe_id: {
            ...prev.cpe_id,
            ssid: payload.data?.ssid ?? prev.cpe_id.ssid,
            password: payload.data?.password ?? prev.cpe_id.password,
            ssid5: payload.data?.ssid5 ?? prev.cpe_id.ssid5,
            password5: payload.data?.password5 ?? prev.cpe_id.password5,
          },
        };
      });
      setIsWaitingForWifi(false);
    },
    isWaitingForWifi,
    (payload) => payload.type === "get_wifi" && payload.sn === serialNumber
  );

  // 🔥 Dengarkan SSE untuk set wifi
  useSSEOneTime(
    customer_id || "",
    async (payload) => {
      const { message } = payload;
      if (message === "Success") {
        toast.success("SSID berhasil diperbarui");

        try {
          const resCPE = await getDetailCPE();
          if (resCPE?.data?.data) {
            const updatedCpeData = resCPE.data.data;
            setCpeDetail(updatedCpeData);

            const sn = updatedCpeData.cpe_id?.serial_number ?? "-";
            setSerialNumber(sn);
            localStorage.setItem("ira-cpe-serial-number", sn);
          }
        } catch (err: any) {
          toastErrorFromAPI(`Gagal fetch ulang CPE setelah set_wifi: ${err}`);
        }

        setIsModalOpen(false);
      } else {
        toast.error(message || "Gagal memperbarui SSID");
      }
      setIsWaitingForSetWifi(false);
    },
    isWaitingForSetWifi,
    (payload) => payload.type === "set_wifi" && payload.sn === serialNumber
  );

  const fetchCPEDetail = async () => {
    try {
      const resCPE = await getDetailCPE();

      if (resCPE?.data?.data) {
        const cpeData = resCPE.data.data;
        setCpeDetail(cpeData);

        const sn = cpeData.cpe_id?.serial_number ?? "-";
        setSerialNumber(sn);
        localStorage.setItem("ira-cpe-serial-number", sn);
      } else {
        setCpeDetail(null);
        setSerialNumber("-");
        localStorage.setItem("ira-cpe-serial-number", "-");
      }
    } catch (err: any) {
      toastErrorFromAPI(err);
      // Opsional: reset state saat error
      setCpeDetail(null);
      setSerialNumber("-");
      localStorage.setItem("ira-cpe-serial-number", "-");
    }
  };

  // trigger SSE
  const fetchSSID = async () => {
    if (!customer_id || !serialNumber) return;

    setIsWaitingForWifi(true);

    try {
      // Panggil API untuk trigger backend kirim SSE
      await getSSID({ sn: serialNumber });
    } catch (err) {
      toastErrorFromAPI(err);
      setIsWaitingForWifi(false);
    }
  };

  const fetchSignal = async (sn: string) => {
    if (!customer_id) {
      toastErrorFromAPI("User tidak terautentikasi");
      setIsLoadingSignal(false);
      setIsWaitingForSignal(false);
      return;
    }

    setIsLoadingSignal(true);
    setIsWaitingForSignal(true); // 🔥 Aktifkan listener SSE

    try {
      // Panggil API untuk trigger backend kirim SSE
      const resSignal = await getSignal({ sn });

      if (resSignal?.data?.statusCode === 200)
        toast.success(resSignal.data.message);
    } catch (err: any) {
      toastErrorFromAPI(err);
      setIsLoadingSignal(false);
      setIsWaitingForSignal(false);
    }
  };

  // ✅ Coba load dari sessionStorage saat serialNumber tersedia
  useEffect(() => {
    if (serialNumber) {
      const saved = loadSignalFromSession();
      if (saved) {
        // Gunakan data tersimpan → jangan panggil API
        setSignalData(saved);
        setIsLoadingSignal(false);
      } else {
        // Tidak ada data → lakukan pengecekan pertama kali
        fetchSignal(serialNumber);
      }
    } else {
      setIsLoadingSignal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialNumber]);

  useEffect(() => {
    fetchCPEDetail();
  }, []);

  // trigger SSE jika data dari db null
  useEffect(() => {
    if (!cpeDetail?.cpe_id?.ssid) {
      fetchSSID();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpeDetail?.cpe_id?.ssid]);

  const handleCheckSignal = () => {
    if (serialNumber) {
      // Hapus cache agar hasil baru disimpan
      sessionStorage.removeItem(SIGNAL_STORAGE_KEY);
      fetchSignal(serialNumber);
    }
  };

  const toggleBlockDevice = (deviceId: number) => {
    setConnectedDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? { ...device, isBlocked: !device.isBlocked }
          : device
      )
    );
  };

  const openEditModal = (type: "2.4 Ghz" | "5 Ghz") => {
    // if (!cpeDetail?.cpe_id) return;

    if (type === "2.4 Ghz") {
      setEditingSSID({
        type,
        ssid: cpeDetail?.cpe_id?.ssid || "",
        password: cpeDetail?.cpe_id?.password || "",
      });
    }

    if (type === "5 Ghz") {
      setEditingSSID({
        type,
        ssid: cpeDetail?.cpe_id?.ssid5 || "",
        password: cpeDetail?.cpe_id?.password5 || "",
      });
    }

    setIsModalOpen(true);
  };

  const handleSaveSSID = async (newSSID: string, newPassword: string) => {
    if (isWaitingForSetWifi || isSaving) return;

    setIsWaitingForSetWifi(true); // 🔥 Aktifkan listener SSE

    try {
      const sn = cpeDetail?.cpe_id?.serial_number || serialNumber;
      if (!sn) throw new Error("Serial number tidak ditemukan");

      let body: SetSSIDBody = { sn };
      if (editingSSID.type === "2.4 Ghz") {
        body = { ...body, ssid: newSSID, password: newPassword };
      } else {
        body = { ...body, ssid5: newSSID, password5: newPassword };
      }

      // Panggil API → backend akan kirim SSE `set_wifi`
      const res = await setSSID(body);
      toast.success(res.data?.message || "Mohon menunggu...");
    } catch (err: any) {
      toastErrorFromAPI(err);
      setIsWaitingForSetWifi(false);
    }
  };

  return (
    <div className="flex md:w-full flex-col md:grid md:grid-cols-3 md:gap-6 items-start">
      <div className="md:col-span-1 w-full space-y-6 max-md:mb-6">
        <SignalStatus
          rsrp={signalData.rsrp}
          rsrq={signalData.rsrq}
          sinr={signalData.sinr}
          cellId={signalData.cell_id}
          level={signalData.level}
          onCheckSignal={handleCheckSignal}
          isLoading={isLoadingSignal}
          message={signalData.message!}
        />
      </div>

      <div className="md:col-span-2 w-full space-y-6">
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div>
            <div className="font-bold text-xl mb-2">Ringkasan Perangkat</div>
            <div className="text-sm sm:text-base">
              <div className="flex gap-2">
                <p className="min-w-30">Brand:</p>
                <p className="">
                  {cpeDetail?.cpe_id?.cpe_brand_model_id?.name ?? "-"}
                </p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-30">Tipe Model:</p>
                <p className="">
                  {cpeDetail?.cpe_id?.cpe_brand_model_id?.model ?? "-"}
                </p>
              </div>
              {/* <div className="flex gap-2">
                <p className="min-w-30">Firmware:</p>
                <p className="">-</p>
              </div> */}
            </div>
          </div>

          <div className="my-6 border border-gray-border-2"></div>

          <div className="font-bold text-xl mb-2">Informasi SSID</div>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            <div className="md:col-span-1 text-sm sm:text-base">
              <div className="flex gap-2">
                <p className="min-w-30 font-bold">SSID 2.4 Ghz</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-30">SSID:</p>
                <p className="">{cpeDetail?.cpe_id?.ssid ?? "-"}</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-30">Kata Sandi:</p>
                <p className="">
                  {maskPassword(cpeDetail?.cpe_id?.password ?? "-")}
                </p>
              </div>
              <button
                onClick={() => openEditModal("2.4 Ghz")}
                className="flex cursor-pointer hover:bg-dark-primary-2 items-center justify-center rounded-lg gap-1 py-2 bg-primary text-white w-40 mt-3"
              >
                Edit 2.4 Ghz <FaRegEdit />
              </button>
            </div>
            <div className="md:col-span-1 text-sm sm:text-base">
              <div className="flex gap-2">
                <p className="min-w-30 font-bold">SSID 5 Ghz</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-30">SSID:</p>
                <p className="">{cpeDetail?.cpe_id?.ssid5 ?? "-"}</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-30">Kata Sandi:</p>
                <p className="">
                  {maskPassword(cpeDetail?.cpe_id?.password5 ?? "-")}
                </p>
              </div>
              <button
                onClick={() => openEditModal("5 Ghz")}
                className="flex cursor-pointer hover:bg-dark-primary-2 items-center justify-center rounded-lg gap-1 py-2 bg-primary text-white w-40 mt-3"
              >
                Edit 5 Ghz <FaRegEdit />
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-2 p-4 sm:p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="font-bold text-xl mb-4">
            Perangkat Tersambung ({connectedDevices.length})
          </div>

          {/* Desktop/Tablet View: Tabel Scrollable */}
          <div className="hidden md:block overflow-x-auto text-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left text-gray-500">
                  <th className="py-2 px-4">No</th>
                  <th className="py-2 px-4">Devices</th>
                  <th className="py-2 px-4">IP</th>
                  <th className="py-2 px-4">MAC</th>
                  <th className="py-2 px-4">Last Seen</th>
                  <th className="py-2 px-4 min-w-37.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {connectedDevices.map((device, index) => (
                  <tr
                    key={device.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4 font-medium">{device.name}</td>
                    <td className="py-3 px-4">{device.ip}</td>
                    <td className="py-3 px-4">{device.mac}</td>
                    <td className="py-3 px-4">{device.lastSeen}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleBlockDevice(device.id)}
                        className={`px-4 py-1 cursor-pointer rounded-lg font-medium ${
                          device.isBlocked
                            ? "bg-white text-primary border border-primary"
                            : "bg-primary text-white border border-primary"
                        }`}
                      >
                        {device.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Card List */}
          <div className="md:hidden space-y-4">
            {connectedDevices.map((device, index) => (
              <div
                key={device.id}
                className={`p-4 rounded-xl border ${
                  device.isBlocked
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{device.name}</h3>
                    <p className="text-sm mt-1">IP: {device.ip}</p>
                    <p className="text-sm">MAC: {device.mac}</p>
                    <p className="text-sm">Last Seen: {device.lastSeen}</p>
                  </div>
                  <button
                    onClick={() => toggleBlockDevice(device.id)}
                    className={`px-4 py-1 cursor-pointer rounded-lg  font-medium ${
                      device.isBlocked
                        ? "bg-white text-primary border border-primary"
                        : "bg-primary text-white border border-primary"
                    }`}
                  >
                    {device.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditSSIDModal
        isOpen={isModalOpen}
        onClose={() => {
          if (isWaitingForSetWifi) toast("Mohon menunggu perubahan SSID");
          if (!isWaitingForSetWifi) setIsModalOpen(false);
        }}
        ssidType={editingSSID.type}
        initialSSID={editingSSID.ssid}
        initialPassword={editingSSID.password}
        onSave={handleSaveSSID}
        isSaving={isWaitingForSetWifi}
      />
    </div>
  );
};

export default DeviceInformation;
