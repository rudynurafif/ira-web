"use client";
import React, { useEffect, useState } from "react";
import CheckCoverage from "./_components/CheckCoverage";
import ListCoverageArea from "./_components/ListCoverageArea";
import ListComingSoon from "./_components/ListComingSoon";
import { useAppSelector } from "@/app/store/store";
import { useBrowserDetection } from "@/app/hooks/useBrowserDetection";
import toast from "react-hot-toast";
import MapCoverageArea from "./_components/MapCoverageArea";
import { dmSans } from "@/app/_shared/font/font";

function Page() {
  const { userInfo } = useAppSelector((state) => state.auth);

  return (
    <div className={dmSans.className}>
      <CheckCoverage />
      <MapCoverageArea />
      <ListCoverageArea />
      {/* <ListComingSoon /> */}
    </div>
  );
}

export default Page;
