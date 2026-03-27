import React from "react";
import background from "@/public/assets/Images/Visi-Misi/background-visi-misi.png";
import petaJangkauan from "@/public/assets/Images/Visi-Misi/peta-jangkauan.svg";
import Image from "next/image";
import circleLeft from "@/public/assets/Images/Visi-Misi/circle-left.svg";
import circleRight from "@/public/assets/Images/Visi-Misi/circle-right.svg";

function VisiMisi() {
  const misiItems = [
    "Menyediakan layanan internet terjangkau berkecepatan tinggi",
    "Mendorong pemerataan akses digital",
    "Membangun kemitraan strategis",
    "Mengembangkan model bisnis yang efisien dan scalable",
    "Berinovasi secara berkelanjutan",
  ];

  return (
    <div className="relative py-20 overflow-hidden">
      {/* <Image
        src={background}
        alt="background"
        className="absolute top-0 left-0 w-full h-full -z-10"
      /> */}

      {/* Circle Left - Bottom Left */}
      <div className="max-md:hidden absolute bottom-0 left-0  -z-10">
        <Image
          src={circleLeft}
          alt="circle left"
          className="w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] h-auto object-contain"
        />
      </div>

      {/* Circle Right - Top Right */}
      <div className="max-md:hidden absolute top-0 right-0  -z-10">
        <Image
          src={circleRight}
          alt="circle right"
          className="w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] h-auto object-contain"
        />
      </div>

      <div className="container mx-auto px-[30px] sm:px-[100px]">
        {/* Visi Section */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-gray-800">
            Visi
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl">
            Menjadi perusahaan penyedia akses internet terdepan yang
            menjembatani kesenjangan digital di seluruh pelosok Indonesia,
            dengan solusi teknologi yang efisien, inklusif, dan berkelanjutan.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#FF2E2E] mb-16 opacity-[0.25]"></div>

        {/* Misi Section */}
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold mb-8 text-gray-800">
            Misi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {misiItems.map((item, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <p className="text-[#212529] pt-2 text-center font-medium">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Peta Jangkauan Section */}
        <div className="mt-20">
          <Image
            src={petaJangkauan}
            alt="Peta Jangkauan"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default VisiMisi;
