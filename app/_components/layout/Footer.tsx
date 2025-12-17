"use client";
import Link from "next/link";
import React from "react";
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";
import { AiFillTikTok } from "react-icons/ai";
import { FaSquareFacebook, FaSquareInstagram } from "react-icons/fa6";
import Image from "next/image";

// image
import iraIcon from "@/public/assets/Icons/IraIconFooter.png";
import moment from "moment";

function Footer() {
  const phoneCS = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";
  const address =
    process.env.NEXT_PUBLIC_ADDRESS ||
    "Jalan Tiang Bendera V No.20 Roa Malaka, Tambora, Jakarta Barat";

  return (
    <div className="bg-white text-xs">
      <div className="container mx-auto px-5 my-2">
        <div className="block lg:flex justify-between items-center gap-10 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full lg:w-[60%]">
            <div className="col-span-1 md:col-span-2">
              <h5 className="font-bold mb-2.5">Address</h5>
              <p className="font-semibold">PT. Telemedia Komunikasi Pratama</p>
              <p>{address}</p>
            </div>
            <div className="col-span-1">
              <h5 className="font-bold mb-2.5">Business Phone Number</h5>
              <Link
                href={`https://wa.me/${phoneCS}`}
                className="hover:underline"
                target="_blank"
              >
                +{phoneCS}
              </Link>
            </div>
            <div className="col-span-1">
              <h5 className="font-bold mb-2.5">Social Media</h5>
              <div className="flex gap-3">
                <Link
                  href={"https://www.instagram.com/internetrakyat.id"}
                  target="_blank"
                  className="hover:cursor-pointer"
                >
                  <FaInstagram size={24} />
                </Link>
                <Link
                  href={"https://www.youtube.com/@internetrakyat.official"}
                  target="_blank"
                  className="hover:cursor-pointer"
                >
                  <FaYoutube size={24} />
                </Link>
                <Link
                  href={"https://www.linkedin.com/company/internet-rakyat"}
                  target="_blank"
                  className="hover:cursor-pointer"
                >
                  <FaLinkedin size={24} />
                </Link>
                <Link
                  href={"https://www.tiktok.com/@internetrakyat.id"}
                  target="_blank"
                  className="hover:cursor-pointer"
                >
                  <FaTiktok size={24} />
                </Link>
              </div>
            </div>
          </div>
          <div className="text-left lg:text-right w-full md:w-[40%] lg:mt-0 mt-5">
            <div className="flex justify-start lg:justify-end gap-5 items-center mb-3">
              <Image src={iraIcon} alt="weave" className="w-[100px]" />
            </div>
            <p className="mb-3 ">
              <span>
                <Link href={"/terms-and-condition"} className="hover:underline">
                  Terms & Conditions
                </Link>
              </span>{" "}
              |{" "}
              <span>
                <Link href={"/privacy-and-policy"} className="hover:underline">
                  Privacy Policy
                </Link>
              </span>{" "}
              |{" "}
              <span>
                <Link href={"/refund-policy"} className="hover:underline">
                  Refund Policy
                </Link>
              </span>
            </p>
            <p className="">
              Copyright © {moment().year()} PT. Telemedia Komunikasi Pratama
            </p>
          </div>
        </div>

        <div className="text-center text-[10px] mt-5">ver. 1.1712.061</div>
      </div>
    </div>
  );
}

export default Footer;
