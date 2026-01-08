import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { useEffect, useState } from "react";
import eyeClose from "@/public/assets/Icons/eye-close.png";
import eye from "@/public/assets/Icons/eye.png";
import Image from "next/image";
import DynamicForm from "@/app/_components/form/DynamicForm";

interface EditSSIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  ssidType: "2.4 Ghz" | "5 Ghz";
  initialSSID: string;
  initialPassword: string;
  onSave: (newSSID: string, newPassword: string) => void;
  isSaving: boolean;
}

const EditSSIDModal: React.FC<EditSSIDModalProps> = ({
  isOpen,
  onClose,
  ssidType,
  initialSSID,
  initialPassword,
  onSave,
  isSaving,
}) => {
  const [ssid, setSSID] = useState(initialSSID);
  const [password, setPassword] = useState(initialPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setSSID(initialSSID);
      setPassword(initialPassword);
      setErrors({});
      setShowPassword(false);
    }
  }, [initialPassword, initialSSID, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ssid || !password) {
      const newErrors: { [key: string]: string } = {};
      if (!ssid) newErrors["ssid"] = "SSID tidak boleh kosong.";
      if (!password) newErrors["password"] = "Kata Sandi tidak boleh kosong.";
      setErrors(newErrors);
      return;
    }

    // setShowPassword(false);
    onSave(ssid, password);
    // onClose();
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
            <DynamicForm
              label="SSID"
              isImportant={true}
              name="ssid"
              type="text"
              value={ssid}
              onChange={setSSID}
              error={errors.ssid || ""}
            />
          </div>

          <div className="mb-6 relative">
            <DynamicForm
              label="Kata Sandi"
              isImportant={true}
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              error={errors.password || ""}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[45px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <Image
                  src={eye}
                  className="w-6 h-6 cursor-pointer"
                  alt="showPassword"
                />
              ) : (
                <Image
                  src={eyeClose}
                  className="w-6 h-6 cursor-pointer"
                  alt="hidePassword"
                />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full disabled:cursor-not-allowed disabled:bg-slate-400 cursor-pointer py-3 bg-primary text-white font-medium rounded-lg hover:bg-dark-primary-2 transition-colors"
          >
            {isSaving ? "Mohon menunggu..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </ModalTemplate>
  );
};

export default EditSSIDModal;
