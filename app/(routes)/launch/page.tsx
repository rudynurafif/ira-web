"use client";

import { useEffect, useState } from "react";
import {
  FiExternalLink,
  FiSmartphone,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function LaunchPage() {
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [progress, setProgress] = useState(0);

  const appStoreUrl =
    "https://apps.apple.com/id/app/internet-rakyat/id6758337694";
  const appName = "Internet Rakyat";

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    // Try to redirect
    const redirectTimer = setTimeout(() => {
      window.location.href = appStoreUrl;
      setIsRedirecting(false);
      // If user is still here after 3 seconds, show fallback
      setTimeout(() => {
        setShowFallback(true);
        setProgress(100);
      }, 3000);
    }, 1000);
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(progressInterval);
    };
  }, [appStoreUrl]);

  const handleManualClick = () => {
    window.open(appStoreUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 font-['NotoSans',sans-serif]">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 text-center border border-blue-100">
          {/* App Icon / Logo Area */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl animate-pulse" />
            <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <FiSmartphone className="w-10 h-10 text-white" />
            </div>
            {isRedirecting && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-4 border-white animate-bounce">
                <FiCheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Membuka {appName}
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 mb-6 leading-relaxed">
            Silakan tunggu sebentar, kami akan mengalihkan Anda ke App Store...
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {progress < 100 ? "Memproses..." : "Selesai"}
            </p>
          </div>

          {/* Loading Dots Animation */}
          {isRedirecting && !showFallback && (
            <div className="flex justify-center gap-1 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          )}

          {/* Fallback Section */}
          {showFallback && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-3">
                <FiAlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Tidak terbuka otomatis?
                </span>
              </div>
              <button
                onClick={handleManualClick}
                className="group w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 active:scale-[0.98]"
              >
                <span>Buka di App Store</span>
                <FiExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
