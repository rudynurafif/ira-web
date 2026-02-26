"use client";
import React, { useState } from "react";
import CheckCoverage from "./_components/CheckCoverage";
import ListCoverageArea from "./_components/ListCoverageArea";
import ListComingSoon from "./_components/ListComingSoon";
import { useAppSelector } from "@/app/store/store";

function Page() {
  const { userInfo } = useAppSelector((state) => state.auth);

  return (
    <div>
      <CheckCoverage />
      <ListCoverageArea />
      {/* <ListComingSoon /> */}
    </div>
  );
}

export default Page;
