"use client";
import React from "react";
import RegistrationWizard from "./_components/RegistrationWizard";

function Page() {
  return (
    <div className="container mx-auto px-6 lg:px-22 xl:px-42 my-6 sm:my-22">
      <RegistrationWizard title="Registrasi IRA" mode="register" />
    </div>
  );
}

export default Page;
