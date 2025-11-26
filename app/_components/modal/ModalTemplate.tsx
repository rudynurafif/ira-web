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
    <div className="fixed z-[9999] inset-0 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={closeModal} />

      {/* Modal Container */}
      <div
        className={`relative bg-white rounded-2xl max-h-[90vh] w-full max-w-2xl overflow-hidden ${
          classNameModal || ""
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute cursor-pointer top-5 right-5 z-10 text-gray-600 hover:text-gray-800"
        >
          <LiaTimesSolid size={24} />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-3rem)] hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalTemplate;
