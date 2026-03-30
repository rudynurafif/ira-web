"use client";
import React from "react";
import FloatingNavbar from "@/app/_components/FloatingNavbar";
import RegistrationWizard from "./_components/RegistrationWizard";

function Page() {
  return (
    <div className="bg-white min-h-screen w-full relative">
      {/* Red background - covers top portion only */}
      <div
        className="absolute top-0 left-0 w-full h-[75vh] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/Images/bg-register.png')" }}
      />

      {/* Content on top */}
      <div className="relative z-10">
        <FloatingNavbar />

        <div className="px-4 md:px-6 pt-20 md:pt-24 pb-10">
          <RegistrationWizard title="Registrasi IRA" mode="register" />
        </div>
      </div>
    </div>
  );
}

export default Page;
