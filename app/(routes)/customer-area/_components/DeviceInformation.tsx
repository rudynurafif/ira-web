import Image from "next/image";
import React, { useEffect, useState } from "react";

import goodSignal from "@/public/assets/Icons/good-signal.svg";
import poorSignal from "@/public/assets/Icons/poor-signal.svg";
import badSignal from "@/public/assets/Icons/bad-signal.svg";
import disconnected from "@/public/assets/Icons/disconnected-signal.svg";
import { FaRegEdit } from "react-icons/fa";
import EditSSIDModal from "./Modal/EditSSIDModal";
import { getSignalLevel, maskPassword } from "@/app/_shared/utils";
import { getSignal } from "@/app/_api/CoreNetwork/CoreNetwork";
import { listConnectedDevices } from "@/app/_shared/data/data";

type SignalLevel = "good" | "poor" | "bad" | "disconnected";

interface SignalStatusProps {
  rsrp: number | null;
  rsrq: number | null;
  sinr: number | null;
  level: "good" | "poor" | "bad" | "disconnected";
  onCheckSignal: () => void;
  isLoading: boolean;
}

const SignalStatus: React.FC<SignalStatusProps> = ({
  rsrp,
  rsrq,
  sinr,
  level,
  onCheckSignal,
  isLoading,
}) => {
  const config = {
    good: {
      icon: goodSignal,
      statusText: "Excellent",
      internetText: "Connected",
    },
    poor: { icon: poorSignal, statusText: "Poor", internetText: "Connected" },
    bad: { icon: badSignal, statusText: "Bad", internetText: "Connected" },
    disconnected: {
      icon: disconnected,
      statusText: "No Signal",
      internetText: "Disconnected",
    },
  };

  const { icon, statusText, internetText } = config[level];

  return (
    <div className="flex flex-col gap-6 bg-white rounded-xl shadow-lg p-6 max-sm:p-4 border border-gray-200">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center">
          <Image
            src={icon}
            alt={`${level} signal icon`}
            width={28}
            height={28}
          />
        </div>
        <div className="flex flex-col">
          <p className="font-medium">
            Status Sinyal: <span className="font-bold">{statusText}</span>
          </p>
          <p>Status Internet: {internetText}</p>
        </div>
      </div>

      {/* Tampilkan metrik sinyal (opsional tapi sangat berguna) */}
      {rsrp !== null && (
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="text-center">
            <div className="font-bold text-primary">{rsrp} dBm</div>
            <div>RSRP</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-primary">{rsrq} dB</div>
            <div>RSRQ</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-primary">{sinr} dB</div>
            <div>SINR</div>
          </div>
        </div>
      )}

      <button
        onClick={onCheckSignal}
        disabled={isLoading}
        className={`py-2 w-full cursor-pointer rounded-lg font-medium text-white transition ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-primary hover:bg-dark-primary-2"
        }`}
      >
        {isLoading ? "Memuat..." : "Cek Sinyal"}
      </button>
    </div>
  );
};

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

  useEffect(() => {
    const sn =
      localStorage.getItem("device-serial-number") || "T100000000000001";

    if (sn) {
      setSerialNumber(sn);
      fetchSignal(sn);
    } else {
      setIsLoadingSignal(false);
    }
  }, []);

  const fetchSignal = async (sn: string) => {
    setIsLoadingSignal(true);
    try {
      const res = await getSignal({ sn });
      const data = res.data?.data;
      const signalData = JSON.parse(
        sessionStorage.getItem("SignalData") || "{}"
      );
      console.log("signal data", signalData);

      if (data) {
        console.log("masuk");
        const level = getSignalLevel(
          signalData.rsrp,
          signalData.rsrq,
          signalData.sinr
        );
        // setSignalData({
        //   rsrp: data.rsrp,
        //   rsrq: data.rsrq,
        //   sinr: data.sinr,
        //   level,
        // });
        setSignalData({
          rsrp: signalData.rsrp,
          rsrq: signalData.rsrq,
          sinr: signalData.sinr,
          level,
        });
      } else {
        setSignalData({
          rsrp: null,
          rsrq: null,
          sinr: null,
          level: "disconnected",
        });
      }
    } catch (err) {
      setSignalData({
        rsrp: null,
        rsrq: null,
        sinr: null,
        level: "disconnected",
      });
    } finally {
      setIsLoadingSignal(false);
    }
  };

  const handleCheckSignal = () => {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSSID, setEditingSSID] = useState({
    type: "2.4 Ghz" as "2.4 Ghz" | "5 Ghz",
    ssid: "WiFi Rumah",
    password: "katasandi123",
  });
  const [ssidData, setSsidData] = useState({
    "2.4 Ghz": {
      ssid: "WiFi Rumah",
      password: "katasandi123",
    },
    "5 Ghz": {
      ssid: "WiFi Rumah",
      password: "katasandi123",
    },
  });

  const openEditModal = (type: "2.4 Ghz" | "5 Ghz") => {
    const current = ssidData[type];
    setEditingSSID({
      type,
      ssid: current.ssid,
      password: current.password,
    });
    setIsModalOpen(true);
  };

  const handleSaveSSID = (newSSID: string, newPassword: string) => {
    setSsidData((prev) => ({
      ...prev,
      [editingSSID.type]: {
        ssid: newSSID,
        password: newPassword,
      },
    }));
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
                <p className="min-w-[120px]">Brand:</p>
                <p className="">Brand A</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">Tipe Model:</p>
                <p className="">Model A</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">Firmware:</p>
                <p className="">Firmware 123</p>
              </div>
            </div>
          </div>

          <div className="my-6 border border-gray-border-2"></div>

          <div className="font-bold text-xl mb-2">Informasi SSID</div>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
            <div className="md:col-span-1 text-sm sm:text-base">
              <div className="flex gap-2">
                <p className="min-w-[120px] font-bold">SSID 2.4 Ghz</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">SSID:</p>
                <p className="">{ssidData["2.4 Ghz"].ssid}</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">Kata Sandi:</p>
                <p className="">{maskPassword(ssidData["2.4 Ghz"].password)}</p>
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
                <p className="min-w-[120px] font-bold">SSID 5 Ghz</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">SSID:</p>
                <p className="">{ssidData["5 Ghz"].ssid}</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">Kata Sandi:</p>
                <p className="">{maskPassword(ssidData["5 Ghz"].password)}</p>
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
                  <th className="py-2 px-4 min-w-[150px]">Action</th>
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
      />
    </div>
  );
};

export default DeviceInformation;
