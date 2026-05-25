/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import { getSetting } from "@/app/_api/Settings/Settings";
import { useAppSelector } from "@/app/store/store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Page = () => {
  const { isLoggedIn } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const checkShowPanduan = async () => {
    const res = await getSetting("show_panduan_folaplus");

    if (!res.data || res.data.data.value !== "true") {
      isLoggedIn ? router.replace("/customer-area") : router.replace("?");
    }
  };

  useEffect(() => {
    checkShowPanduan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-5 py-10">
      Halaman panduan penggunaan Voucher Folaplus
    </div>
  );
};

export default Page;
