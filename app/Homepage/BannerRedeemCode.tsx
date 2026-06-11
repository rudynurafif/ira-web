import { useRouter } from "next/navigation";
import React from "react";

function BannerRedeemCode() {
  const router = useRouter();
  return (
    <div className="w-full relative bg-[linear-gradient(17deg,#520201_11.61%,#B80502_97.23%)] text-white px-4 md:px-[3%] lg:px-[17%] pb-5  ">
      <div className=" mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 p-4 rounded-[30px] md:-mt-1 border-[5px] border-[#FF6E6E] relative z-10 bg-[linear-gradient(182deg,#FFF4F4_2.08%,#F5F5F5_87.22%)]">
        {/* Voucher Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl flex items-center justify-center transform rotate-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="164"
              height="163"
              viewBox="0 0 164 163"
              fill="none"
            >
              <g clipPath="url(#clip0_6190_639)">
                <path
                  d="M27.3204 67.3203C25.0236 68.6464 23.3476 70.8306 22.6612 73.3924C21.9747 75.9542 22.3341 78.6837 23.6602 80.9806L33.6602 98.3011C35.957 96.975 38.6866 96.6156 41.2483 97.3021C43.8101 97.9885 45.9943 99.6645 47.3204 101.961C48.6465 104.258 49.0058 106.988 48.3194 109.55C47.633 112.111 45.957 114.295 43.6602 115.622L53.6602 132.942C54.9862 135.239 57.1704 136.915 59.7322 137.601C62.294 138.288 65.0236 137.928 67.3204 136.602L136.602 96.6023C138.899 95.2763 140.575 93.0921 141.262 90.5303C141.948 87.9685 141.589 85.2389 140.263 82.9421L130.263 65.6216C127.966 66.9477 125.236 67.307 122.675 66.6206C120.113 65.9342 117.929 64.2582 116.602 61.9613C115.276 59.6645 114.917 56.9349 115.603 54.3731C116.29 51.8113 117.966 49.6272 120.263 48.3011L110.263 30.9806C108.937 28.6837 106.752 27.0077 104.191 26.3213C101.629 25.6349 98.8993 25.9942 96.6024 27.3203L27.3204 67.3203ZM84.6169 51.5607L94.8621 54.3059L79.306 112.362L69.0608 109.617L84.6169 51.5607ZM55.7483 68.4589C59.9918 66.0089 65.3876 67.4547 67.8376 71.6982C69.0112 73.7309 69.3293 76.1466 68.7218 78.4138C68.1143 80.681 66.631 82.614 64.5983 83.7875C60.3548 86.2375 54.959 84.7917 52.509 80.5482C51.3354 78.5155 51.0174 76.0999 51.6249 73.8327C52.2324 71.5655 53.7156 69.6325 55.7483 68.4589ZM99.3245 80.1351C103.568 77.6851 108.964 79.1309 111.414 83.3744C112.587 85.4071 112.905 87.8228 112.298 90.09C111.69 92.3572 110.207 94.2902 108.175 95.4638C103.931 97.9138 98.5352 96.468 96.0852 92.2244C94.9116 90.1917 94.5936 87.7761 95.2011 85.5089C95.8086 83.2417 97.2918 81.3087 99.3245 80.1351Z"
                  fill="url(#paint0_linear_6190_639)"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_6190_639"
                  x1="61.9614"
                  y1="47.3203"
                  x2="101.961"
                  y2="116.602"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#8F0402" />
                  <stop offset="1" stopColor="#290101" />
                </linearGradient>
                <clipPath id="clip0_6190_639">
                  <rect
                    width="120"
                    height="120"
                    fill="white"
                    transform="translate(0 60) rotate(-30)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-[#000] text-2xl md:text-3xl mb-1 md:mb-2 font-extrabold">
            Punya Voucher Folaplay?
          </h2>
          <p className="text-sm font-semibold md:text-base text-[#8F0402] mb-1">
            Redeem sekarang & nikmati gratis hingga 2 bulan*
          </p>
          <p className="text-xs text-[#8F0402]">*khusus pengguna baru</p>
        </div>

        {/* Button */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              router.push("/redeem-code");
            }}
            className="w-full md:w-auto bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-3 md:py-4 px-8 md:px-12 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 text-base md:text-lg"
          >
            Redeem Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

export default BannerRedeemCode;
