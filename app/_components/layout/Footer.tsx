"use client";
import Link from "next/link";
import React from "react";
import { FaInstagram } from "react-icons/fa";
import { FaSquareFacebook } from "react-icons/fa6";
import Image from "next/image";

// image
import iraIcon from "@/public/assets/Icons/IraIcon.svg";

function Footer() {
  return (
    <div className="bg-white max-sm:text-sm">
      <div className="container mx-auto px-5 my-8">
        <div className="block lg:flex justify-between items-center gap-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full lg:w-[60%]">
            <div className="col-span-1 md:col-span-2">
              <h5 className="font-bold mb-2.5">Address</h5>
              <p className="font-semibold">PT. Telemedia Komunikasi Pratama</p>
              <p>
                Ruko Fatmawati Mas Blok III Kav. 328 - 329, Jl. RS Fatmawati No.
                20, Cilandak Barat, Cilandak, Jakarta Selatan, Indonesia
              </p>
            </div>
            <div className="col-span-1">
              <h5 className="font-bold mb-2.5">Business Phone Number</h5>
              <Link
                href={"https://wa.me/6281188011388"}
                className="hover:underline"
                target="_blank"
              >
                +6281188011388
              </Link>
            </div>
            <div className="col-span-1">
              <h5 className="font-bold mb-2.5">Social Media</h5>
              <div className="flex gap-3">
                <Link href={"https://www.instagram.com/"} target="_blank">
                  <FaInstagram size={24} />
                </Link>
                <Link href={"https://www.facebook.com/"} target="_blank">
                  <FaSquareFacebook size={24} />
                </Link>
              </div>
            </div>
          </div>
          <div className="text-left lg:text-right w-full md:w-[40%] lg:mt-0 mt-5">
            <div className="flex justify-start lg:justify-end gap-5 items-center mb-3">
              <Image src={iraIcon} alt="weave" className="w-[125px]" />
            </div>
            <p className="mb-3">
              <span>
                <Link href={"/terms-and-condition"} target="_blank">Terms & Conditions</Link>
              </span>{" "}
              |{" "}
              <span>
                <Link href={"/terms-and-condition"} target="_blank">Privacy Policy</Link>
              </span>
            </p>
            <p className="">
              Copyright © 2025 PT. Telemedia Komunikasi Pratama
            </p>
          </div>
        </div>

        <div className="text-center text-[10px] mt-5">ver. 1.1111.033</div>
      </div>
    </div>
  );
}

export default Footer;
