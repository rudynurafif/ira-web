"use client";

import { toastErrorFromAPI } from "@/app/_shared/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa6";

function Page() {
  const router = useRouter();

  const content_terms = [
    {
      id: 1,
      title: "Umum",
      description: [
        `Syarat dan Ketentuan ini ("Syarat") mengatur penyediaan layanan internet ("Layanan") oleh Internet Rakyat kepada pelanggan ("Pelanggan").`,
        `Dengan berlangganan Layanan, Pelanggan dianggap telah menyetujui Syarat ini.`,
        `Internet Rakyat berhak mengubah Syarat ini kapan saja, dan perubahan tersebut akan berlaku setelah dipublikasikan di situs resmi.`,
      ],
    },
    {
      id: 2,
      title: "Layanan",
      description: [
        `Internet Rakyat menyediakan konektivitas internet dengan kecepatan sesuai paket yang dipilih. Kecepatan aktual dapat bervariasi tergantung kondisi jaringan, kemampuan perangkat, dan faktor eksternal lainnya.`,
        `Layanan ditawarkan sebagai paket "Unlimited" tanpa pembatasan Kebijakan Penggunaan Wajar (FUP).`,
        `Internet Rakyat berhak melakukan pemeliharaan jaringan yang mungkin berdampak sementara pada Layanan. Pelanggan akan diberi tahu sebelumnya jika memungkinkan.`,
      ],
    },
    {
      id: 3,
      title: "Berlangganan dan Pembayaran",
      description: [
        `Biaya berlanggan untuk Layanan adalah Rp. 100.000 per bulan dan atau 250.000 per bulan, termasuk pajak yang berlaku.`,
        `Pelanggan akan mendapatkan gratis bulan pertama untuk siklus penagihan awal.`,
        `Internet Rakyat menawarkan bulan pertama gratis untuk Pelanggan baru. Promosi ini tidak dapat dipindahtangankan dan hanya berlaku untuk siklus penagihan pertama.`,
        `Pembayaran dapat dilakukan melalui metode yang tercantum di situs resmi atau saluran pembayaran resmi.`,
      ],
    },
    {
      id: 4,
      title: "Instalasi dan Peralatan",
      description: [
        `Instalasi disediakan secara gratis oleh Internet Rakyat.`,
        `Pelanggan akan diberikan modem yang biayanya sudah termasuk dalam biaya berlangganan. Modem tetap menjadi milik Internet Rakyat.`,
        `Pelanggan harus memastikan modem dikembalikan dalam kondisi baik setelah penghentian Layanan. Biaya dapat dikenakan untuk peralatan yang hilang atau rusak.`,
      ],
    },
    {
      id: 5,
      title: "Tanggung Jawab Pelanggan",
      description: [
        `Pelanggan setuju untuk menggunakan Layanan secara bertanggung jawab dan sesuai dengan hukum dan peraturan yang berlaku.`,
        `Pelanggan tidak boleh menggunakan Layanan untuk kegiatan ilegal, termasuk namun tidak terbatas pada spam, peretasan, atau distribusi perangkat lunak berbahaya.`,
        `Pelanggan bertanggung jawab atas keamanan perangkat dan koneksi jaringannya sendiri.`,
      ],
    },
    {
      id: 6,
      title: "Penghentian",
      description: [
        `Pelanggan dapat menghentikan langganan dengan memberikan pemberitahuan tertulis setidaknya 30 hari kepada Internet Rakyat.`,
        // `Layanan ditawarkan sebagai paket "Unlimited" tanpa pembatasan Kebijakan Penggunaan Wajar (FUP).`,
        `Setelah penghentian, Pelanggan harus menyelesaikan pembayaran yang tertunda dan mengembalikan peralatan milik Internet Rakyat.`,
      ],
    },
    {
      id: 7,
      title: "Tanggung Jawab",
      description: [
        `Internet Rakyat tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan Layanan.`,
        `Tanggung jawab Internet Rakyat terbatas pada jumlah yang dibayarkan oleh Pelanggan untuk siklus penagihan saat ini.`,
      ],
    },
    {
      id: 8,
      title: "Hukum Yang Berlaku",
      description: [
        `Syarat ini diatur oleh hukum Republik Indonesia.`,
        `Sengketa yang timbul dari Syarat ini akan diselesaikan melalui mediasi. Jika mediasi gagal, sengketa akan diselesaikan di pengadilan negeri yang berwenang di Indonesia.`,
      ],
    },
  ];

  const [title, setTitle] = useState<string>("");

  const [content, setContent] = useState<string>("");

  useEffect(() => {
    getTNCData();
  }, []);

  async function getTNCData() {
    try {
      //   const res_tnc = await getDataTNC();
      //   // console.log(res_tnc.data);
      //   setTitle(res_tnc.data[0].title);
      //   setContent(res_tnc.data[0].content);
    } catch (err: any) {
      toastErrorFromAPI(err, "Gagal muat data Syarat dan Ketentuan");
    }
  }

  return (
    <div>
      <div className="pt-20 pb-10 bg-linear-to-r from-[#ba2424] to-[#ff6666]">
        <div className="container mx-auto">
          <div
            className="flex items-center gap-2 text-white mb-5 cursor-pointer px-3"
            onClick={() => router.push("/")}
          >
            <FaArrowLeft size={20} /> Kembali
          </div>
          <h1 className="text-white text-2xl md:text-4xl font-bold text-center">
            {title}
          </h1>
        </div>
      </div>
      <div className="container mx-auto py-10">
        <ul className="list-[upper-alpha] list-outside text-primary text-base sm:text-2xl font-bold mx-10">
          {content_terms.map((item: any) => {
            return (
              <li key={item.id} className="mb-5 ml-4">
                <h3 className=" mb-2">{item.title}</h3>
                <ul className="list-decimal text-black font-normal text-sm sm:text-base">
                  {item.description.map((desc: any, index: number) => {
                    return (
                      <li key={index} className=" mb-2">
                        {desc}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
          <li className="mb-5">
            <h3 className=" mb-2">Informasi Kontak</h3>
            <p className="text-black font-normal text-sm sm:text-base mb-3">
              Untuk pertanyaan atau dukungan, silakan hubungi:
            </p>
            <ul className="list-decimal text-black font-normal text-sm sm:text-base ml-4">
              <li className=" mb-2">
                Layanan Pelanggan:{" "}
                <Link
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_CS}`}
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {process.env.NEXT_PUBLIC_PHONE_CS}
                </Link>{" "}
              </li>
              <li className=" mb-2">
                Email:{" "}
                <Link
                  href={`mailto: ${process.env.NEXT_PUBLIC_EMAIL_CS}`}
                  className="text-primary hover:underline"
                >
                  {process.env.NEXT_PUBLIC_EMAIL_CS}
                </Link>{" "}
              </li>
              <li className=" mb-2">
                Alamat:{" "}
                <Link
                  href={`${process.env.NEXT_PUBLIC_ADDRESS_GMAPS}`}
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {process.env.NEXT_PUBLIC_ADDRESS}
                </Link>
              </li>
            </ul>
          </li>
          <li className="mb-5">
            <h3 className=" mb-2">Pengakuan</h3>
            <p className="text-black font-normal text-sm sm:text-base">
              Dengan berlangganan Layanan Internet Rakyat, Pelanggan menyatakan
              telah membaca, memahami, dan menyetujui Syarat dan Ketentuan ini.
            </p>
          </li>
        </ul>
        <div dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export default Page;
