"use client";
import React from "react";
import CheckCoverage from "./_components/CheckCoverage";
import ListCoverageArea from "./_components/ListCoverageArea";
import ListComingSoon from "./_components/ListComingSoon";

function Page() {
  return (
    <div>
      <CheckCoverage />
      <ListCoverageArea />
      {/* <ListComingSoon /> */}
    </div>
  );
}

export default Page;
