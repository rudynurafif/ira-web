import Image from "next/image";
import React, { useEffect, useState } from "react";

import goodSignal from "@/public/assets/Icons/good-signal.svg";
import poorSignal from "@/public/assets/Icons/poor-signal.svg";
import badSignal from "@/public/assets/Icons/bad-signal.svg";
import disconnected from "@/public/assets/Icons/disconnected-signal.svg";
import { FaRegEdit } from "react-icons/fa";
import EditSSIDModal from "./Modal/EditSSIDModal";

type SignalLevel = "good" | "poor" | "bad" | "disconnected";

interface SignalStatusProps {
  level: SignalLevel;
  onCheckSignal: () => void;
}

const SignalStatus: React.FC<SignalStatusProps> = ({
  level,
  onCheckSignal,
}) => {
  const config: Record<
    SignalLevel,
    { icon: any; statusText: string; internetText: string }
  > = {
    good: {
      icon: goodSignal,
      statusText: "Good",
      internetText: "Connected",
    },
    poor: {
      icon: poorSignal,
      statusText: "Poor",
      internetText: "Connected",
    },
    bad: {
      icon: badSignal,
      statusText: "Bad",
      internetText: "Connected",
    },
    disconnected: {
      icon: disconnected,
      statusText: "Loss",
      internetText: "Disconnected",
    },
  };

  const { icon, statusText, internetText } = config[level];

  return (
    <div
      className={`flex flex-col gap-6 bg-linear-to-b from-white via-white to-[#FFDCDC] rounded-xl shadow-lg p-6 max-sm:p-4`}
    >
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
          <p>Status Signal: {statusText}</p>
          <p>Status Internet: {internetText}</p>
        </div>
      </div>

      <button
        onClick={onCheckSignal}
        className="py-2 cursor-pointer text-center w-full rounded-lg bg-primary hover:bg-dark-primary-2 text-white"
      >
        Cek Signal
      </button>
    </div>
  );
};

// --- KOMPONEN UTAMA ---
const DeviceInformation = () => {
  const signalLevels = ["good", "poor", "bad", "disconnected"] as const;
  type SignalLevel = (typeof signalLevels)[number];

  const [signalLevel, setSignalLevel] = useState<SignalLevel>("good");

  // Fungsi untuk generate level acak
  const generateRandomSignal = () => {
    const randomIndex = Math.floor(Math.random() * signalLevels.length);
    setSignalLevel(signalLevels[randomIndex]);
  };

  // Jalankan sekali saat mount
  useEffect(() => {
    generateRandomSignal();
  }, []);

  const data = [
    {
      id: 1,
      name: "Iphone 16",
      ip: "192.168.1.23",
      mac: "80:ab:2c:19:aa:12",
      lastSeen: "1:30:25 PM",
      isBlocked: false,
    },
    {
      id: 2,
      name: "Samsung S25 Ultra",
      ip: "192.168.1.44",
      mac: "90:ab:2c:19:aa:12",
      lastSeen: "1:23:34 PM",
      isBlocked: true,
    },
    {
      id: 3,
      name: "Macbook Pro",
      ip: "192.168.1.51",
      mac: "32:ab:2c:19:aa:12",
      lastSeen: "2:34:09 PM",
      isBlocked: false,
    },
  ];

  const [connectedDevices, setConnectedDevices] = useState(data);

  const toggleBlockDevice = (deviceId: number) => {
    setConnectedDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? { ...device, isBlocked: !device.isBlocked }
          : device
      )
    );
  };

  // --- STATE UNTUK MODAL SSID ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSSID, setEditingSSID] = useState({
    type: "2.4 Ghz" as "2.4 Ghz" | "5 Ghz",
    ssid: "WiFi Rumah",
    password: "katasandi123",
  });

  // --- FUNGSI UNTUK MEMBUKA MODAL ---
  const openEditModal = (type: "2.4 Ghz" | "5 Ghz") => {
    // Di sini Anda bisa mengambil data dari state atau API jika ada
    // Untuk contoh, kita gunakan nilai statis seperti di desain
    let ssid = "WiFi Rumah";
    let password = "katasandi123";

    // Jika ingin membuat lebih dinamis, Anda bisa simpan data SSID di state terpisah
    // Misalnya: const [ssidData, setSSIDData] = useState({ "2.4 Ghz": {...}, "5 Ghz": {...} })

    setEditingSSID({
      type,
      ssid,
      password,
    });
    setIsModalOpen(true);
  };

  // --- FUNGSI UNTUK MENYIMPAN PERUBAHAN ---
  const handleSaveSSID = (newSSID: string, newPassword: string) => {
    // Di sini Anda bisa update state atau kirim ke API
    console.log(
      `Saved ${editingSSID.type}: SSID=${newSSID}, Password=${newPassword}`
    );

    // Contoh: update state jika Anda punya state untuk SSID
    // setSSIDData(prev => ({ ...prev, [editingSSID.type]: { ssid: newSSID, password: newPassword } }));
  };

  return (
    <div className="flex md:w-full flex-col md:grid md:grid-cols-3 md:gap-6 items-start">
      <div className="md:col-span-1 w-full space-y-6 max-md:mb-6">
        <SignalStatus
          level={signalLevel}
          onCheckSignal={generateRandomSignal}
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
                <p className="min-w-[120px]">SSID 2.4 Ghz:</p>
                <p className="">Brand A</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">SSID:</p>
                <p className="">WiFi Rumah</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">Kata Sandi:</p>
                <p className="">******</p>
              </div>
              <button
                onClick={() => openEditModal("2.4 Ghz")}
                className="flex cursor-pointer hover:bg-dark-primary-2 items-center justify-center rounded-lg gap-1 py-2 bg-primary text-white w-40 mt-3"
              >
                Edit <FaRegEdit />
              </button>
            </div>
            <div className="md:col-span-1 text-sm sm:text-base">
              <div className="flex gap-2">
                <p className="min-w-[120px]">SSID 5 Ghz:</p>
                <p className="">Brand A</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">SSID:</p>
                <p className="">WiFi Rumah</p>
              </div>
              <div className="flex gap-2">
                <p className="min-w-[120px]">Kata Sandi:</p>
                <p className="">*****</p>
              </div>
              <button
                onClick={() => openEditModal("5 Ghz")}
                className="flex cursor-pointer hover:bg-dark-primary-2 items-center justify-center rounded-lg gap-1 py-2 bg-primary text-white w-40 mt-3"
              >
                Edit <FaRegEdit />
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

      {/* RENDER MODAL */}
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
