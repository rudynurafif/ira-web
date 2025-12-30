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

const DeviceInformation = () => {
  const [signalData, setSignalData] = useState<{
    rsrp: number | null;
    rsrq: number | null;
    sinr: number | null;
    level: "good" | "poor" | "bad" | "disconnected";
  }>({
    rsrp: null,
    rsrq: null,
    sinr: null,
    level: "disconnected",
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
  // const { lastEvent } = useSSE();
  const token = getCookie("token-ira");
  const decodedToken = token
    ? (decodeJwt(token as string) as DecodedToken)
    : null;
  const customer_id = decodedToken?.customer_id;
  const [isWaitingForSignal, setIsWaitingForSignal] = useState(false);
  const [isWaitingForWifi, setIsWaitingForWifi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 Dengarkan SSE hanya saat menunggu sinyal
  useSSEOneTime(
    customer_id || "",
    (payload) => {
      const { rsrp, rsrq, sinr } = payload.data || {};
      if (
        typeof rsrp === "number" &&
        typeof rsrq === "number" &&
        typeof sinr === "number"
      ) {
        setSignalData({
          rsrp,
          rsrq,
          sinr,
          level: getSignalLevel(rsrp, rsrq, sinr),
        });
      } else {
        setSignalData({
          rsrp: null,
          rsrq: null,
          sinr: null,
          level: "disconnected",
        });
      }
      setIsLoadingSignal(false);
      setIsWaitingForSignal(false);
    },
    isWaitingForSignal,
    (payload) => payload.type === "get_signal"
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

  useEffect(() => {
    const sn = localStorage.getItem("ira-cpe-serial-number") || "TEST";
    if (sn) setSerialNumber(sn);
  }, []);

  const fetchCPEDetail = async () => {
    try {
      const resCPE = await getDetailCPE();

      if (resCPE) setCpeDetail(resCPE?.data?.data ?? {});
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
    }
  };

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
      toastErrorFromAPI(new Error("User tidak terautentikasi"));
      setIsLoadingSignal(false);
      return;
    }

    setIsLoadingSignal(true);
    setIsWaitingForSignal(true); // 🔥 Aktifkan listener SSE

    try {
      // Panggil API untuk trigger backend kirim SSE
      await getSignal({ sn });
    } catch (err: any) {
      toastErrorFromAPI(err);
      setIsLoadingSignal(false);
      setIsWaitingForSignal(false);
    }
  };

  useEffect(() => {
    fetchCPEDetail();
  }, []);

  useEffect(() => {
    if (!cpeDetail?.cpe_id?.ssid) {
      fetchSSID();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpeDetail?.cpe_id?.ssid]);

  useEffect(() => {
    if (serialNumber) {
      setSerialNumber(serialNumber);
      fetchSignal(serialNumber);
    } else {
      setIsLoadingSignal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialNumber]);

  // useEffect(() => {
  //   if (!lastEvent) return;

  //   switch (lastEvent.type) {
  //     case "get_signal": {
  //       const { rsrp, rsrq, sinr } = lastEvent.data || {};

  //       if (
  //         typeof rsrp !== "number" ||
  //         typeof rsrq !== "number" ||
  //         typeof sinr !== "number"
  //       ) {
  //         setSignalData({
  //           rsrp: null,
  //           rsrq: null,
  //           sinr: null,
  //           level: "disconnected",
  //         });
  //         setIsLoadingSignal(false);
  //         return;
  //       }

  //       setSignalData({
  //         rsrp,
  //         rsrq,
  //         sinr,
  //         level: getSignalLevel(rsrp, rsrq, sinr),
  //       });

  //       setIsLoadingSignal(false);
  //       break;
  //     }

  //     case "get_wifi": {
  //       setCpeDetail((prev) => {
  //         if (!prev) return prev;

  //         return {
  //           ...prev,
  //           cpe_id: {
  //             ...prev.cpe_id,
  //             ...lastEvent.data,
  //           },
  //         };
  //       });
  //       break;
  //     }

  //     default:
  //       break;
  //   }
  // }, [lastEvent]);

  const handleCheckSignal = () => {
    console.log(serialNumber);
    if (serialNumber) fetchSignal(serialNumber);
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
    if (isSaving) return;
    setIsSaving(true);

    try {
      const sn = cpeDetail?.cpe_id?.serial_number || serialNumber;

      if (!sn) {
        throw new Error("Serial number tidak ditemukan");
      }

      let body: SetSSIDBody = { sn };

      if (editingSSID.type === "2.4 Ghz") {
        body = {
          ...body,
          ssid: newSSID,
          password: newPassword,
        };
      }

      if (editingSSID.type === "5 Ghz") {
        body = {
          ...body,
          ssid5: newSSID,
          password5: newPassword,
        };
      }

      await setSSID(body);

      // fallback kalau SSE delay
      setCpeDetail((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          cpe_id: {
            ...prev.cpe_id,
            ...(editingSSID.type === "2.4 Ghz"
              ? { ssid: newSSID, password: newPassword }
              : { ssid5: newSSID, password5: newPassword }),
          },
        };
      });

      setIsModalOpen(false);
    } catch (err: any) {
      toastErrorFromAPI(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex md:w-full flex-col md:grid md:grid-cols-3 md:gap-6 items-start">
      <div className="md:col-span-1 w-full space-y-6 max-md:mb-6">
        <SignalStatus
          rsrp={signalData.rsrp}
          rsrq={signalData.rsrq}
          sinr={signalData.sinr}
          level={signalData.level}
          onCheckSignal={handleCheckSignal}
          isLoading={isLoadingSignal}
        />
      </div>

      <div className="md:col-span-2 w-full space-y-6">
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-lg">
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
              <div className="flex gap-2">
                <p className="min-w-30">Firmware:</p>
                <p className="">-</p>
              </div>
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

        <div className="col-span-2 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
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
          setIsModalOpen(false);
        }}
        ssidType={editingSSID.type}
        initialSSID={editingSSID.ssid}
        initialPassword={editingSSID.password}
        onSave={handleSaveSSID}
        isSaving={isSaving}
      />
    </div>
  );
};

export default DeviceInformation;
