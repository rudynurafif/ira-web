"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import Image from "next/image";

// image
import iraIcon from "@/public/assets/Icons/IraIconFooter.png";
import moment from "moment";
import { getSetting } from "@/app/_api/Settings/Settings";
import googlePlay from "@/public/assets/Images/GooglePlayBlack.png";
import appStore from "@/public/assets/Images/AppStoreBlack.png";
import { BsTelephone } from "react-icons/bs";
import { MdOutlineMail } from "react-icons/md";
import SkeletonBase from "../skeletons/SkeletonBase";
import { handleDownloadClick } from "@/app/_shared/utils";

function Footer() {
  const [phoneCS, setPhoneCS] = useState<string | null>("");
  const [phoneCSTel, setPhoneCSTel] = useState<string | null>("");
  const [mail, setMail] = useState<string | null>("");
  const [address, setAddress] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setIsLoading(true);

      const getOfficeAddress = async () => {
        const resSetting = await getSetting("office_address");
        setAddress(
          resSetting.data?.data?.value ||
            process.env.NEXT_PUBLIC_ADDRESS ||
            "Jalan Tiang Bendera V No.20 Roa Malaka, Tambora, Jakarta Barat",
        );
      };

      const getPhoneCS = async () => {
        const resSetting = await getSetting("cs_phone");
        setPhoneCS(
          resSetting.data?.data?.value ||
            process.env.NEXT_PUBLIC_PHONE_CS ||
            "6281110689111",
        );
      };

      // const getCSTel = async () => {
      //   const resSetting = await getSetting("cs_phone_tel");
      //   setPhoneCSTel(resSetting.data?.data?.value || null);
      // };

      const getCSMail = async () => {
        const resSetting = await getSetting("cs_email");
        setMail(
          resSetting.data?.data?.value ||
            process.env.NEXT_PUBLIC_EMAIL_CS ||
            "cs@internetrakyat.id",
        );
      };

      getOfficeAddress();
      getPhoneCS();
      // getCSTel();
      getCSMail();
    } catch (err: any) {
      console.error(err?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-white text-xs">
      <div className="container mx-auto px-5 my-2">
        <div className="block lg:flex justify-between items-center gap-10 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full lg:w-[70%]">
            <div className="col-span-1 md:col-span-2">
              <h5 className="font-bold mb-2.5">Address</h5>
              <p className="font-semibold" suppressHydrationWarning>
                <span>PT. Telemedia Komunikasi Pratama</span>
              </p>
              {isLoading ? (
                <div className="mt-2 flex flex-col gap-1">
                  <SkeletonBase height="h-4" />
                  <SkeletonBase height="h-4" />
                </div>
              ) : (
                <p suppressHydrationWarning>
                  <span>{address}</span>
                </p>
              )}
            </div>
            <div className="col-span-1 ">
              <h5 className="font-bold mb-2.5">Business Contact</h5>
              {isLoading ? (
                <div className="flex flex-col gap-1">
                  <SkeletonBase height="h-4" />
                  <SkeletonBase height="h-4" />
                  <SkeletonBase height="h-4" />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1 items-center">
                    <FaWhatsapp size={14} />
                    <div className="hover:underline">{phoneCS}</div>
                  </div>
                  {/* {phoneCSTel && (
                    <div className="flex gap-1 items-center">
                      <BsTelephone size={14} />
                      <Link
                        href={`tel:${phoneCSTel}`}
                        className="hover:underline"
                        target="_blank"
                      >
                        {phoneCSTel}
                      </Link>
                    </div>
                  )} */}
                  <div className="flex gap-1 items-center">
                    <MdOutlineMail size={14} />
                    <Link
                      href={`mailto:${mail}`}
                      className="hover:underline"
                      target="_blank"
                    >
                      {mail}
                    </Link>
                  </div>
                </div>
              )}
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

              <h5 className="font-bold mb-2.5 mt-5">Download Aplikasi IRA</h5>
              <div className="mt-2 flex flex-row gap-2">
                <div
                  className="cursor-pointer"
                  onClick={() => handleDownloadClick("google")}
                >
                  <Image
                    src={googlePlay}
                    alt="Google Play"
                    className="w-24 hover:scale-105"
                  />
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => handleDownloadClick("apple")}
                >
                  <Image
                    src={appStore}
                    alt="App Store"
                    className="w-24 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="text-left lg:text-right w-full md:w-[30%] lg:mt-0 mt-5">
            <div className="flex justify-start lg:justify-end gap-5 items-center mb-3">
              <Image src={iraIcon} alt="weave" className="w-25" />
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
            <p className="" suppressHydrationWarning>
              <span>
                Copyright © {moment().year()} PT. Telemedia Komunikasi Pratama
              </span>
            </p>
          </div>
        </div>

        <div className="text-center text-[10px] mt-5">ver. 1.0804.03</div>
      </div>
    </div>
  );
}

export default Footer;
