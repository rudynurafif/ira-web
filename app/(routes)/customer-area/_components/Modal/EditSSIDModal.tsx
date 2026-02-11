import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { useEffect, useState } from "react";
import eyeClose from "@/public/assets/Icons/eye-close.png";
import eye from "@/public/assets/Icons/eye.png";
import Image from "next/image";
import DynamicForm from "@/app/_components/form/DynamicForm";
import { HAS_EMOJI_REGEX } from "@/app/_shared/utils/formatter";

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
    if (isSaving) {
      // Pasang event handler
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "";
        return "";
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isSaving]);

  const validateSSID = (value: string) => {
    if (!value.trim()) {
      return `${ssidType} SSID tidak boleh kosong`;
    }

    if (/\s/.test(value)) {
      return `${ssidType} SSID tidak boleh mengandung spasi`;
    }
    if (value.length < 3 || value.length > 32) {
      return "SSID harus 3–32 karakter";
    }
    return "";
  };

  // Validasi Password: 8–63 karakter, tidak boleh kosong
  const validatePassword = (value: string) => {
    if (!value.trim()) {
      return `${ssidType} Password tidak boleh kosong`;
    }
    if (value.length < 8 || value.length > 63) {
      return "Password harus 8–63 karakter";
    }

    if (HAS_EMOJI_REGEX.test(value)) {
      return "Password tidak boleh mengandung emoji";
    }
    return "";
  };

  useEffect(() => {
    if (isOpen) {
      setSSID(initialSSID);
      setPassword(initialPassword);
      setErrors({});
      setShowPassword(false);
    }
  }, [initialPassword, initialSSID, isOpen]);

  if (!isOpen) return null;

  const handleSSIDChange = (value: string) => {
    const cleanedValue = value.replace(/\s+/g, "");
    setSSID(cleanedValue);
    setErrors((prev) => ({
      ...prev,
      ssid: validateSSID(value),
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ssidError = validateSSID(ssid);
    const passwordError = validatePassword(password);

    if (!ssid || !password) {
      setErrors({
        ssid: ssidError,
        password: passwordError,
      });
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
              onChange={handleSSIDChange}
              error={errors.ssid || ""}
            />
            <p className="text-xs text-gray-500 mt-2">
              SSID harus 3–32 karakter dan tidak boleh mengandung spasi.
            </p>
          </div>

          <div className="mb-6 relative">
            <DynamicForm
              label="Kata Sandi"
              isImportant={true}
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              error={errors.password || ""}
            />
            <p className="text-xs text-gray-500 mt-2">
              Password harus 8–63 karakter dan tidak boleh mengandung spasi.
            </p>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-11.25 text-gray-500 hover:text-gray-700"
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
            disabled={
              isSaving || Boolean(errors.ssid) || Boolean(errors.password)
            }
            className="w-full disabled:cursor-not-allowed! disabled:bg-slate-400 cursor-pointer py-3 bg-primary text-white font-medium rounded-lg hover:bg-dark-primary-2 transition-colors"
          >
            {isSaving ? "Mohon menunggu..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </ModalTemplate>
  );
};

export default EditSSIDModal;
