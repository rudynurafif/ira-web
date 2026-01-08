import { FaSignInAlt, FaUserCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ModalLoginRedirect({
  onClose,
}: {
  onClose: () => void;
}) {
  const router = useRouter();

  function goToLogin() {
    router.push("/auth/login");
  }

  return (
    <div className="p-6 sm:p-8 text-center">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <FaUserCheck className="text-primary" size={28} />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-old-primary">
        Nomor Sudah Terdaftar
      </h2>

      {/* Description */}
      <p className="text-gray-600 mt-3 text-sm sm:text-base">
        Nomor handphone yang kamu masukkan sudah terdaftar di sistem kami.
        Silakan login untuk melanjutkan.
      </p>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={goToLogin}
          className="w-full flex border-2 border-primary hover:border-dark-primary-2 cursor-pointer items-center justify-center gap-2 bg-primary hover:bg-dark-primary-2 text-white font-bold py-3 rounded-xl"
        >
          <FaSignInAlt />
          Login Sekarang
        </button>

        <button
          onClick={onClose}
          className="w-full border-2 cursor-pointer border-primary bg-white hover:bg-red-50 text-primary font-semibold py-3 rounded-xl"
        >
          Daftar Nomor HP Baru
        </button>
      </div>
    </div>
  );
}
