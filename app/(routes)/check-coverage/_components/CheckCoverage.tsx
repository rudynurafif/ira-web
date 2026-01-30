"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import ModalCheckCoverage from "./ModalCheckCoverage";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { getCheckCoverage } from "@/app/_api/Location/Location";
import { IoCloseSharp } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_MAP_API_KEY || "";

function CheckCoverage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [modalResult, setModalResult] = useState<boolean>(false);
  const [isCoverage, setIsCoverage] = useState<boolean>(false);
  const [mitraPaket, setMitraPaket] = useState<string | null>(null);
  const [dataChooseMap, setDataChooseMap] = useState<any>(null);

  // ✅ controlled input
  const [address, setAddress] = useState<string>("");

  // ✅ cooldown 10 detik
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownCount, setCooldownCount] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // dedupe query
  const lastAutocompleteQueryRef = useRef<string | null>(null);

  const startCooldown = (duration: number = 10, onFinish?: () => void) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);

    setIsCooldown(true);
    setCooldownCount(duration);

    cooldownRef.current = setInterval(() => {
      setCooldownCount((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          setIsCooldown(false);
          if (onFinish) onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ✅ search autocomplete (manual via button/enter)
  const performAutocompleteSearch = async (query: string) => {
    const q = (query || "").trim();

    if (q.length < 3) {
      setPredictions([]);
      toast.error("Minimal 3 karakter untuk mencari lokasi");
      return;
    }

    if (isCooldown) {
      toast.error(
        `Harap tunggu ${cooldownCount} detik lagi sebelum mencari lagi`,
      );
      return;
    }

    if (lastAutocompleteQueryRef.current === q) {
      // same query, no need fetch again
      return;
    }

    lastAutocompleteQueryRef.current = q;

    setIsLoading(true);

    // mulai cooldown dan lakukan fetch setelah cooldown selesai
    // (biar persis pola MapGeoapify kamu)
    startCooldown(10, async () => {
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            q,
          )}&filter=countrycode:id&lang=id&apiKey=${GEOAPIFY_KEY}`,
        );
        const data = await res.json();
        setPredictions(data.features || []);
      } catch (err) {
        console.error("Error fetching Geoapify autocomplete:", err);
        toast.error("Gagal memuat saran lokasi");
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    });
  };

  // input change: reset pilihan + tutup dropdown (opsional: biarkan predictions sampai user cari lagi)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setDataChooseMap(null);

    // kalau user edit input, sebaiknya tutup list lama
    if (predictions.length) setPredictions([]);
  };

  // pilih alamat dari dropdown
  const handlePredictionClick = (feature: any) => {
    const { properties, geometry } = feature;
    const formattedAddress = properties.formatted;
    const lat = geometry.coordinates[1];
    const lng = geometry.coordinates[0];

    setAddress(formattedAddress);

    if (inputRef.current) {
      inputRef.current.value = formattedAddress; // optional, karena controlled
    }

    setDataChooseMap({
      location: formattedAddress,
      lat,
      lng,
      rawData: feature,
    });

    setPredictions([]);
  };

  // clear input
  const clearInput = () => {
    setAddress("");
    if (inputRef.current) inputRef.current.value = "";
    setDataChooseMap(null);
    setPredictions([]);
    lastAutocompleteQueryRef.current = null;
  };

  // cek coverage
  const checkRadius = async () => {
    if (!dataChooseMap) {
      toast.error("Lokasi belum dipilih. Harap pilih lokasi terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        latitude: String(dataChooseMap.lat),
        longitude: String(dataChooseMap.lng),
        address: dataChooseMap.location,
        raw_result: dataChooseMap.rawData,
      };

      const res = await getCheckCoverage(payload);
      setIsCoverage(res.data?.result.inside_coverage);
      setMitraPaket(res.data?.result.mitra_id || null);
      setModalResult(true);
    } catch (err: any) {
      console.error("Check coverage error:", err);
      toast.error("Gagal mengecek ketersediaan");
    } finally {
      setIsLoading(false);
    }
  };

  // cleanup
  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  return (
    <div className="sm:bg-[url(/assets/check-coverage/background-check-coverage.png)] bg-[url(/assets/check-coverage/background-coverage-mobile.png)] bg-cover bg-no-repeat py-52 px-[5%] min-[1261px]:px-[10%]">
      <div className="w-full flex justify-center">
        <h1 className="text-center text-white text-3xl/[120%] sm:text-4xl/[120%] md:text-5xl/[120%] xl:text-[52px]/[120%] font-bold w-full lg:w-3/5">
          Apakah area Anda berada dalam jangkauan Internet Rakyat (IRA)?
        </h1>
      </div>
      <p className="text-center text-white mt-7.5 text-base sm:text-xl md:text-2xl">
        Yuk, cek alamat Anda di sini!
      </p>

      <div className="flex flex-col sm:flex-row gap-5 items-center mt-7 xl:w-3/5 lg:w-4/5 w-full mx-auto">
        {/* Input + Search + Clear */}
        <div className="w-full sm:w-4/5 md:w-3/5 relative">
          <div className="relative flex items-center gap-2">
            {/* ✅ Button Cari */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => performAutocompleteSearch(address)}
              className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl cursor-pointer shadow-md disabled:cursor-not-allowed!"
            >
              <span className="font-bold font-semibol sm:block hidden sm:text-lg md:text-xl">
                Cari
              </span>
              <FaSearch size={24} color="black" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={address}
              placeholder="Masukkan alamat Anda"
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  performAutocompleteSearch(address);
                }
              }}
              className="text-base bg-white sm:text-lg md:text-xl px-6 py-4 w-full rounded-xl"
              disabled={isLoading}
            />

            {/* ✅ Tombol Clear */}
            {address && (
              <button
                type="button"
                onClick={clearInput}
                className="absolute bg-white rounded-full p-1 cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <IoCloseSharp color="#d7201d" size={28} />
              </button>
            )}
          </div>

          {/* Loading + cooldown counter */}
          {isLoading && (
            <div className="border-2 rounded-lg px-4 py-2 w-full block absolute z-50 bg-white mt-2">
              Mencari lokasi...{" "}
              {cooldownCount > 0 && (
                <span className="text-primary font-semibold">
                  ({cooldownCount})
                </span>
              )}
            </div>
          )}

          {/* Prediksi */}
          {!isLoading && predictions.length > 0 && (
            <div className="border-2 rounded-lg px-2 py-2 absolute z-50 bg-white max-h-60 overflow-y-auto w-full mt-2">
              {predictions.map((feature, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePredictionClick(feature)}
                  className="cursor-pointer max-sm:text-xs text-sm flex gap-2 items-start py-2 hover:bg-gray-100"
                >
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-[#d7201d]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                  </div>
                  <div className="text-dark-primary">
                    {feature.properties.formatted}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Cek */}
        <div className="w-full sm:w-1/5 md:w-2/5">
          <button
            type="button"
            onClick={checkRadius}
            disabled={!dataChooseMap || isLoading}
            className={`px-6 py-4 text-white disabled:cursor-not-allowed! font-bold cursor-pointer rounded-xl sm:text-xl text-center w-full ${
              dataChooseMap && !isLoading
                ? "bg-linear-to-b from-[#9C1816] to-[#D7201D] shadow-lg border border-white hover:opacity-90"
                : "bg-slate-500 cursor-not-allowed!"
            }`}
          >
            Cek Ketersediaan
          </button>
        </div>
      </div>

      {/* Modal Result */}
      {modalResult && (
        <ModalTemplate
          closeModal={() => setModalResult(false)}
          classNameModal="max-md:!rounded-none"
        >
          <ModalCheckCoverage
            statusCoverage={isCoverage}
            mitraPaket={mitraPaket}
            address={dataChooseMap}
            closeModal={() => setModalResult(false)}
          />
        </ModalTemplate>
      )}
    </div>
  );
}

export default CheckCoverage;
