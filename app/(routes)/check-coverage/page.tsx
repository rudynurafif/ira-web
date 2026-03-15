"use client";
import React, { useEffect, useState } from "react";
import CheckCoverage from "./_components/CheckCoverage";
import ListCoverageArea from "./_components/ListCoverageArea";
import ListComingSoon from "./_components/ListComingSoon";
import { useAppSelector } from "@/app/store/store";
import toast from "react-hot-toast";

function Page() {
  const { userInfo } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isChrome =
      /Chrome|CriOS/i.test(ua) &&
      !/Edg|OPR|Opera|UCBrowser|SamsungBrowser|MiuiBrowser/i.test(ua);

    if (!isChrome) {
      toast.error(
        "Deteksi Browser: Anda tidak menggunakan Google Chrome. \n\n" +
          "Demi kelancaran dan keamanan, silakan buka internetrakyat.id di web browser Google Chrome.",
        {
          id: "browser-warning-toast",
          duration: 15_000,
          position: "bottom-center",
          style: { whiteSpace: "pre-line" },
        },
      );
    }
  }, []);

  return (
    <div>
      <CheckCoverage />
      <ListCoverageArea />
      {/* <ListComingSoon /> */}
    </div>
  );
}

export default Page;
