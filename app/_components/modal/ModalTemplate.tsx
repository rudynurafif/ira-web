import React, { ReactNode } from "react";
import { LiaTimesSolid } from "react-icons/lia";

function ModalTemplate({
  closeModal,
  classNameModal,
  children,
  width = "max-w-2xl",
  justify = "justify-center",
  isCloseButton = true,
}: {
  closeModal: () => void;
  classNameModal?: string;
  children: ReactNode;
  width?: string;
  justify?: string;
  isCloseButton?: boolean;
}) {
  return (
    <div
      className={`fixed z-[9999] inset-0 flex items-center ${justify} p-4 sm:p-8`}
    >
      {/* Overlay */}
      <div
        className="absolute h-screen inset-0 bg-black/50"
        onClick={closeModal}
      />

      {/* Modal Container */}
      <div
        className={`relative bg-white rounded-2xl max-h-[90vh] w-full ${width}  ${
          classNameModal || ""
        }`}
      >
        {/* Close Button */}
        {isCloseButton && (
          <button
            onClick={closeModal}
            className="absolute cursor-pointer top-5 right-5 z-9999 text-black bg-white p-2 rounded-full"
          >
            <LiaTimesSolid size={24} />
          </button>
        )}

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-3rem)] hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalTemplate;
