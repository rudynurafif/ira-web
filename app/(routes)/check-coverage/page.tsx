"use client";
import React, { useEffect, useState } from "react";
import CheckCoverage from "./_components/CheckCoverage";
import ListCoverageArea from "./_components/ListCoverageArea";
import ListComingSoon from "./_components/ListComingSoon";
import { useAppSelector } from "@/app/store/store";
import { useBrowserDetection } from "@/app/hooks/useBrowserDetection";
import toast from "react-hot-toast";

function Page() {
  const { userInfo } = useAppSelector((state) => state.auth);

  useBrowserDetection();

  return (
    <div>
      <CheckCoverage />
      <ListCoverageArea />
      {/* <ListComingSoon /> */}
    </div>
  );
}

export default Page;
