import React, { useState } from "react";
import Step1 from "./Modal/Step1";

function ModalCheckCoverage({
  statusCoverage,
  address,
  mitraPaket,
  closeModal,
}: {
  statusCoverage: boolean;
  address: any;
  mitraPaket: string | null;
  closeModal: () => void;
}) {
  const [currentPosition, setCurrentPosition] = useState<number>(1);
  const [Creds, setCreds] = useState<string>("");

  // console.log("address", address);

  if (currentPosition === 1) {
    return (
      <Step1
        status={statusCoverage}
        setStep={(val) => setCurrentPosition(val)}
        onClose={closeModal}
      />
    );
  }
}

export default ModalCheckCoverage;
