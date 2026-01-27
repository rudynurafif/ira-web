import Link from "next/link";
// import notFound from "../public/404.png";
import Image from "next/image";
import { IoMdArrowRoundBack } from "react-icons/io";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center w-full items-center p-6">
      <Image
        src="/assets/Images/not-found.png"
        alt="Halaman tidak ditemukan"
        width={800}
        height={800}
        priority
        sizes="(max-width: 640px) 90vw, 500px"
        className="w-[90%] max-w-125 h-auto mb-6"
      />

      <div className="text-center">
        <h2 className="text-lg font-bold">Halaman tidak ditemukan.</h2>
        {/* <p>Could not find requested resource</p> */}
        <div className="w-full  my-10 animate-bounce">
          <Link
            href="/"
            className="rounded-full flex items-center justify-center gap-2 bg-primary hover:bg-dark-primary-2 text-white bg-blue w-full p-2 font-bold"
          >
            <IoMdArrowRoundBack />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
