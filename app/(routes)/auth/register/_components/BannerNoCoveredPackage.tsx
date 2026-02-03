import Image from "next/image";
import bannerImage from "@/public/assets/Images/banner-out-coverage.png";

const BannerNoCoveredPackage = () => {
  return (
    <div className="rounded-xl border bg-[url('/assets/Images/packageBackground.svg')] bg-cover bg-center cursor-pointer transition px-4 pt-3 pb-4">
      <div className="flex items-center gap-4">
        {/* Icon or Image */}
        <Image
          src={bannerImage}
          alt="Service Available Soon"
          width={50}
          height={50}
        />

        <div>
          <h2 className="font-bold text-2xl">
            Layanan di Area Kamu Segera Hadir
          </h2>
          <p className="mt-2 text-lg">
            Jangan khawatir! Silakan daftar sekarang agar akunmu terdaftar di
            sistem kami. Kamu bisa langsung login ke Aplikasi IRA dan
            mendapatkan notifikasi saat layanan Internet Rakyat sudah tersedia
            di area kamu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BannerNoCoveredPackage;
