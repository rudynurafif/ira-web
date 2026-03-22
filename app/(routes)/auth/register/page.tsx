"use client";
import React from "react";
import RegistrationForm from "./_components/RegistrationForm";

function Page() {
  return (
    <div className="container mx-auto px-6 lg:px-22 xl:px-42 sm:my-10 my-6">
      <RegistrationForm title="Registrasi IRA" mode="register" />
    </div>
  );
}

export default Page;
