"use client";
import React, { useState } from "react";
import CheckCoverage from "./_components/CheckCoverage";
import ListCoverageArea from "./_components/ListCoverageArea";
import ListComingSoon from "./_components/ListComingSoon";
import { useAppSelector } from "@/app/store/store";
import Loader from "@/app/_components/Loader";

function Page() {
  const { userInfo } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(true);

  if (!userInfo) return <Loader />;

  return (
    <div>
      {!userInfo || userInfo.is_coverage === false ? <CheckCoverage /> : null}
      <ListCoverageArea />
      {/* <ListComingSoon /> */}
    </div>
  );
}

export default Page;
