import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { useEffect, useState } from "react";
import eyeClose from "@/public/assets/Icons/eye-close.png";
import eye from "@/public/assets/Icons/eye.png";
import Image from "next/image";

// --- KOMPONEN MODAL EDIT SSID ---
interface EditSSIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  ssidType: "2.4 Ghz" | "5 Ghz";
  initialSSID: string;
  initialPassword: string;
  onSave: (newSSID: string, newPassword: string) => void;
}

const EditSSIDModal: React.FC<EditSSIDModalProps> = ({
  isOpen,
  onClose,
  ssidType,
  initialSSID,
  initialPassword,
  onSave,
}) => {
  const [ssid, setSSID] = useState(initialSSID);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPassword(false);
    onSave(ssid, password);
    onClose();
  };

  return (
    <ModalTemplate closeModal={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full shadow-xl">
        <div className="flex justify-center items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Informasi SSID</h2>
        </div>

        <h3 className="text-xl font-bold mb-4">SSID {ssidType}</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SSID*
            </label>
            <input
              type="text"
              value={ssid}
              onChange={(e) => setSSID(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kata Sandi*
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <Image src={eye} className="w-6 h-6 cursor-pointer" alt="showPassword" />
                ) : (
                  <Image
                    src={eyeClose}
                    className="w-6 h-6 cursor-pointer"
                    alt="hidePassword"
                  />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </ModalTemplate>
  );
};

export default EditSSIDModal;
