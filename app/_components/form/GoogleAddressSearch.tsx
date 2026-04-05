"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash/debounce";
import { MdSearch, MdClose, MdMyLocation } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import toast from "react-hot-toast";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

interface GoogleAddressSearchProps {
  onPlaceChange: (payload: {
    latitude: number;
    longitude: number;
    address: string;
    postcode?: string;
    raw_result?: any;
  }) => void;
  placeholder?: string;
  className?: string;
}

const GoogleAddressSearch: React.FC<GoogleAddressSearchProps> = ({
  onPlaceChange,
  placeholder = "Cari lokasimu..",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPendingSearch, setIsPendingSearch] = useState(false);
  const [searchCooldown, setSearchCooldown] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // SEARCH EXECUTION: Hit API cuma pas Cooldown selesai (dan dipicu oleh klik button)
  const executeSearch = useCallback(async () => {
    if (!query || query.length < 3) return;

    setIsLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&components=country:id&language=id`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK") {
        setSuggestions(data.results.slice(0, 5) || []);
        setIsOpen(true);
      } else if (data.status === "ZERO_RESULTS") {
        setSuggestions([]);
        setIsOpen(true);
        toast.error("Lokasi tidak ditemukan");
      }
    } catch (error) {
      console.error("Google Geocoding Search failed:", error);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
      setIsPendingSearch(false); // Selesai antrean
    }
  }, [query]);

  // Handle countdown logic
  useEffect(() => {
    if (searchCooldown > 0) {
      const timer = setInterval(() => {
        setSearchCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (searchCooldown === 0 && isPendingSearch) {
      // Pas cooldown habis, baru eksekusi API
      executeSearch();
    }
  }, [searchCooldown, isPendingSearch, executeSearch]);

  const initiateSearch = () => {
    if (
      !query ||
      query.length < 3 ||
      searchCooldown > 0 ||
      isLoading ||
      isPendingSearch
    )
      return;
    setSearchCooldown(5); // Start the 5s wait
    setIsPendingSearch(true); // Mark as triggered
    setIsOpen(false); // Close suggestions during wait
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    const { lat, lng } = item.geometry.location;
    const address = item.formatted_address;

    let postcode = "";
    item.address_components.forEach((comp: any) => {
      if (comp.types.includes("postal_code")) postcode = comp.long_name;
    });

    onPlaceChange({
      latitude: lat,
      longitude: lng,
      address,
      postcode,
      raw_result: item,
    });

    setQuery(address);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative group">
        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="pl-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <MdClose size={18} />
            </button>
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && initiateSearch()}
            className="w-full py-3.5 px-3 text-sm text-black bg-transparent border-none focus:ring-0 outline-none font-medium"
          />

          <div className="flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={initiateSearch}
              disabled={
                query.length < 3 ||
                isLoading ||
                searchCooldown > 0 ||
                isPendingSearch
              }
              className={`px-3 py-2 mr-1 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center whitespace-nowrap ${
                searchCooldown > 0 || isPendingSearch
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-primary text-white hover:bg-primary/90 active:scale-95"
              }`}
            >
              {searchCooldown > 0 ? (
                `Tunggu (${searchCooldown}s)`
              ) : (
                <span className="flex items-center gap-1">
                  <MdSearch size={22} />
                  <span className="hidden md:inline">Cari</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center gap-3 z-60">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-gray-600 italic">
              Mencari alamat...
            </span>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-1000 mt-1 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[250px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-4 hover:bg-gray-50 flex flex-col border-b last:border-b-0 border-gray-50 group"
            >
              <span className="text-sm font-semibold text-black group-hover:text-primary transition-colors">
                {item.formatted_address.split(",")[0]}
              </span>
              <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                {item.formatted_address}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleAddressSearch;
