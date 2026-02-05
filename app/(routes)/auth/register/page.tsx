"use client";
import RegistrationForm from "./_components/RegistrationForm";

function Page() {
  return (
    <div className="container mx-auto px-6 lg:px-22 xl:px-42 my-6 sm:my-22">
      <RegistrationForm title="Registrasi IRA" mode="register" />;
    </div>
  );
}

export default Page;
