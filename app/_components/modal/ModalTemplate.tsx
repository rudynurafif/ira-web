import React, { ReactNode } from "react";
import { LiaTimesSolid } from "react-icons/lia";

function ModalTemplate({
  closeModal,
  classNameModal,
  children,
}: {
  closeModal: () => void;
  classNameModal?: string;
  children: ReactNode;
}) {
  return (
    <div className="fixed p-6 top-0 left-0 right-0 bottom-0 flex items-center justify-center z-1000000000">
      <div
        className="fixed bg-[#00000080] w-full h-full"
        onClick={closeModal}
      />
      <div
        className={
          "z-10001 bg-white rounded-[20px] overflow-auto relative " +
          classNameModal
        }
      >
        <div className="absolute top-5 right-5">
          <LiaTimesSolid
            size={24}
            onClick={closeModal}
            className="cursor-pointer"
            color="#001D47"
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export default ModalTemplate;
