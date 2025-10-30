import React from "react";

type LoadingModalProps = {
  isOpen: boolean;
};

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg flex items-center justify-center">
        <div className="spinner-border animate-spin h-8 w-8 border-t-4 border-blue-500 rounded-full"></div>
        <span className="ml-4 text-lg text-gray-700">Sedang Memproses...</span>
      </div>
    </div>
  );
};

export default LoadingModal;
