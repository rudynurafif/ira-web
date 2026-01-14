// app/cubmu/_components/CubmuLoginModal.tsx
"use client";

import React from "react";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";

interface CubmuLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  password: string;
}

const CubmuLoginModal: React.FC<CubmuLoginModalProps> = ({
  isOpen,
  onClose,
  username,
  password,
}) => {
  return (
    <ModalTemplate closeModal={onClose}>
      <div className="bg-white mx-auto rounded-2xl p-6 w-full">
        <h3 className="text-xl font-bold mb-4">Username & Kata Sandi CubMu</h3>
        <p className="text-sm text-gray-600 mb-4">
          Berikut username dan kata sandi untuk login aplikasi CubMu.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <span className="font-mono">{username}</span>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => navigator.clipboard.writeText(username)}
            >
              📋
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kata Sandi
          </label>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <span className="font-mono">{password}</span>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => navigator.clipboard.writeText(password)}
            >
              📋
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
        >
          Tutup
        </button>
      </div>
    </ModalTemplate>
  );
};

export default CubmuLoginModal;
