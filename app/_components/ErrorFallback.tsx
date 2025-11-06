"use client";

import { BiError } from "react-icons/bi";
import React from "react";

type ErrorFallbackProps = {
  message?: string;
  onRetry?: () => void;
};

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  message = "Terjadi kesalahan saat memuat data.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-red-500">
        <BiError size={48} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Terjadi Kesalahan!</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-dark-primary-2 transition"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
};

export default ErrorFallback;
