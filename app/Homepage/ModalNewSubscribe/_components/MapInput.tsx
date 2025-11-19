"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import { IoSearchOutline } from "react-icons/io5";

import {
  AdvancedMarker,
  APIProvider,
  MapCameraChangedEvent,
  MapCameraProps,
  MapMouseEvent,
  Map as Maps,
  Marker,
  Pin,
} from "@vis.gl/react-google-maps";
import axios from "axios";
import { FaLocationDot, FaXmark } from "react-icons/fa6";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
// import { checkCoverage, GetListGeocode } from "@/app/_api/Location/GetLocation";
import { debounce } from "@/app/_shared/utils";

import markerImage from "@/public/assets/icon/Pinpoint.webp";

import Image from "next/image";
import { getCheckCoverage, GetListGeocode } from "@/app/_api/Location/Location";

const libs: Libraries = ["places", "geocoding"];

function MapInput({
  setCheckResult,
  setFullAddress,
  addressFromLastStep,
}: {
  setCheckResult: (res: any) => void;
  setFullAddress: (res: any) => void;
  addressFromLastStep?: any;
}) {
  const [coverageLocation, setCoverageLocation] = useState<any>(null);
  const [locationMap, setLocationMap] = useState<any>(null);
  const [isAvail, setIsAvail] = useState("");
  const router = useRouter();
  const placeAutoCompleteRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk countdown autocomplete
  const [countdown, setCountdown] = useState<number>(0);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // State untuk cooldown drag/click map
  const [isCooldown, setIsCooldown] = useState<boolean>(false);
  const [cooldownCount, setCooldownCount] = useState<number>(0); // Countdown untuk cooldown map
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // State untuk melacak apakah sedang dalam proses drag
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Tambahkan ref untuk menyimpan timeoutId dari autocomplete
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Tambahkan ref untuk menyimpan timeoutId dari input listener
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY
      ? process.env.NEXT_PUBLIC_MAP_API_KEY
      : "",
    libraries: libs,
  });

  const [customIcon, setCustomIcon] = useState<any>(null);
  const [iconAnimation, setIconAnimation] = useState<any>(null);

  useEffect(() => {
    if (isLoaded) {
      // ✅ Semua akses ke google.maps dilakukan di sini
      setCustomIcon({
        url: "/assets/icon/Pinpoint.webp",
        scaledSize: new google.maps.Size(40, 40),
      });
      setIconAnimation(google.maps.Animation.BOUNCE);
    }
  }, [isLoaded]);

  const [autoComplete, setAutoComplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]); // Ensure state is typed correctly

  async function Checkradius({
    lat,
    long,
    address,
    raw_result,
  }: {
    lat?: any;
    long?: any;
    address?: any;
    raw_result?: any;
  }) {
    setIsLoading(true);
    const payload = {
      latitude: String(lat),
      longitude: String(long),
      address: address,
      raw_result: raw_result,
    };

    await getCheckCoverage(payload).then(
      (res) => {
        if (res?.data?.statusCode === 200) {
          setCheckResult(res?.data?.result ? res?.data?.result : null);
          setFullAddress(payload);
        } else {
          toast.error("Check Coverage Error");
        }
        setIsLoading(false);
      },
      (err: any) => {
        // console.error(err.response.data.message);
        setIsLoading(false);
        toast.error("Check Coverage Error");
      }
    );
  }

  useEffect(() => {
    // console.log(addressFromLastStep, "check address 123");
    if (addressFromLastStep) {
      if (addressFromLastStep.lng === "" && addressFromLastStep.lat === "") {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;

              getLocation(latitude, longitude);
              setLocationMap({ lat: latitude, lng: longitude });
            },
            (error) => {
              console.error("Error getting current location:", error);
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
        }
      } else {
        if (placeAutoCompleteRef.current) {
          placeAutoCompleteRef.current.value = addressFromLastStep.location;
        }
        setCoverageLocation({
          location: addressFromLastStep.location || "",
          lat: addressFromLastStep.lat,
          lng: addressFromLastStep.lng,
          rawData: addressFromLastStep.rawData,
        });
        setLocationMap({
          lat: Number(addressFromLastStep.lat),
          lng: Number(addressFromLastStep.lng),
        });
      }
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getLocation(latitude, longitude);
            setLocationMap({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error("Error getting current location:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    }
  }, [addressFromLastStep]);

  // Fungsi untuk memulai countdown autocomplete
  const startCountdown = useCallback((duration: number = 10) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setCountdown(duration);
    setIsLoadingSearch(true);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          setIsLoadingSearch(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Fungsi untuk menghentikan countdown autocomplete
  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setIsLoadingSearch(false);
    setCountdown(0);
  }, []);

  // Fungsi untuk menghentikan timeout autocomplete
  const stopAutocompleteTimeout = useCallback(() => {
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
      autocompleteTimeoutRef.current = null;
    }
  }, []);

  // Fungsi untuk menghentikan timeout input
  const stopInputTimeout = useCallback(() => {
    if (inputTimeoutRef.current) {
      clearTimeout(inputTimeoutRef.current);
      inputTimeoutRef.current = null;
    }
  }, []);

  // Fungsi untuk memulai cooldown drag/click map
  const startCooldown = useCallback((duration: number = 10) => {
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
    }

    setIsCooldown(true);
    setCooldownCount(duration); // Set initial countdown value

    cooldownRef.current = setInterval(() => {
      setCooldownCount((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
          }
          setIsCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (isLoaded && placeAutoCompleteRef.current) {
      const autoCompleteService = new google.maps.places.AutocompleteService();
      const placesService = new google.maps.places.PlacesService(
        document.createElement("div")
      );

      placeAutoCompleteRef.current.addEventListener("input", () => {
        // Cegah autocomplete jika dalam masa cooldown map atau sedang dragging
        if (isCooldown || isDragging) {
          setPredictions([]);
          stopAutocompleteTimeout(); // Hentikan timeout autocomplete jika sedang berjalan
          return;
        }

        const inputValue = placeAutoCompleteRef.current!.value;

        if (inputValue.length >= 3) {
          // Hentikan timeout sebelumnya jika ada
          stopInputTimeout();

          setPredictions([]); // Clear previous predictions immediately

          // Hentikan timeout autocomplete sebelumnya jika ada
          stopAutocompleteTimeout();

          // Mulai countdown 10 detik
          startCountdown(10);

          // Simpan timeoutId ke ref agar bisa diakses dari luar
          inputTimeoutRef.current = setTimeout(() => {
            // Ambil predictions setelah countdown selesai
            autoCompleteService.getPlacePredictions(
              { input: inputValue, componentRestrictions: { country: "ID" } },
              (predictions, status) => {
                if (
                  status === google.maps.places.PlacesServiceStatus.OK &&
                  predictions
                ) {
                  setPredictions(predictions);
                } else {
                  setPredictions([]); // Handle the case where there are no predictions
                }
                setIsLoadingSearch(false);
              }
            );
          }, 10000); // Tunggu 10 detik sesuai countdown
        } else {
          setPredictions([]);
          stopCountdown();
          stopAutocompleteTimeout(); // Hentikan timeout autocomplete jika sedang berjalan
          stopInputTimeout(); // Hentikan timeout input jika sedang berjalan
        }
      });

      placeAutoCompleteRef.current.addEventListener("blur", () => {
        setTimeout(() => {
          setPredictions([]);
          stopCountdown();
          stopAutocompleteTimeout(); // Hentikan timeout autocomplete jika sedang berjalan
          stopInputTimeout(); // Hentikan timeout input jika sedang berjalan
        }, 200); // Delay to allow click event
      });

      // Hentikan countdown jika komponen di-unmount
      return () => {
        stopCountdown();
        stopAutocompleteTimeout(); // Hentikan timeout autocomplete saat unmount
        stopInputTimeout(); // Hentikan timeout input saat unmount
      };
    }
  }, [
    isLoaded,
    startCountdown,
    stopCountdown,
    isCooldown,
    isDragging,
    stopAutocompleteTimeout,
    stopInputTimeout,
  ]);

  // Define handlePredictionClick outside of useEffect so it can be used in the JSX
  const handlePredictionClick = (
    prediction: google.maps.places.AutocompletePrediction
  ) => {
    // Cegah jika dalam masa cooldown map
    if (isCooldown) {
      toast.error("Silakan tunggu sebelum melakukan aksi lagi");
      return;
    }

    // Hentikan countdown jika user memilih prediction
    stopCountdown();
    setPredictions([]);
    stopAutocompleteTimeout(); // Hentikan timeout autocomplete jika sedang berjalan
    stopInputTimeout(); // Hentikan timeout input jika sedang berjalan

    const placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );
    const request = {
      placeId: prediction.place_id,
      fields: ["name", "formatted_address", "geometry", "address_components"],
    };

    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        // setSelectedPlace(place);

        if (placeAutoCompleteRef.current) {
          placeAutoCompleteRef.current.value =
            place?.name + ", " + place?.formatted_address || "";
        }
        setCoverageLocation({
          location: place?.name + ", " + place?.formatted_address,
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
          rawData: place,
        });

        setLocationMap({
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
        });

        const latitude = place.geometry?.location?.lat();
        const longitude = place.geometry?.location?.lng();
        const address = place?.name + ", " + place?.formatted_address;
        const rawData = place;

        Checkradius({
          lat: latitude,
          long: longitude,
          address: address,
          raw_result: rawData,
        });
      }
    });
  };

  useEffect(() => {
    if (coverageLocation === null) {
      if (placeAutoCompleteRef.current) {
        placeAutoCompleteRef.current.value = "";
      }
    } else {
      if (placeAutoCompleteRef.current) {
        placeAutoCompleteRef.current.value = coverageLocation.location;
      }
    }
  }, [coverageLocation]);

  const [cameraProps, setCameraProps] = useState<MapCameraProps | null>(null);

  useEffect(() => {
    if (locationMap !== null) {
      setCameraProps({
        center: locationMap,
        zoom: 18,
      });
    }
  }, [locationMap]);

  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => setCameraProps(ev.detail),
    []
  );

  async function getLocation(lat: any, long: any) {
    // console.log(lat, long);
    const results = await GetListGeocode({
      latitude: lat,
      longitude: long,
    });
    setCoverageLocation({
      location: results?.data?.result?.results[0]?.formatted_address || "",
      lat: results?.data?.result?.results[0]?.geometry?.location?.lat,
      lng: results?.data?.result?.results[0]?.geometry?.location?.lng,
      rawData: results.data.result.results[0],
    });

    const latitude = results?.data?.result?.results[0]?.geometry?.location?.lat;
    const longitude =
      results?.data?.result?.results[0]?.geometry?.location?.lng;
    const address = results?.data?.result?.results[0]?.formatted_address || "";
    const rawData = results.data.result.results[0];

    Checkradius({
      lat: latitude,
      long: longitude,
      address: address,
      raw_result: rawData,
    });
  }

  const debouncedFetchLocationData = useCallback(
    debounce(getLocation, 10000),
    []
  );

  // const debouncedFetchCheckCoverage = useCallback(
  //   debounce(Checkradius, 2500),
  //   []
  // );

  async function dragMarker(e: google.maps.MapMouseEvent) {
    // Cegah drag jika dalam masa cooldown
    if (isCooldown) {
      toast.error("Silakan tunggu sebelum melakukan aksi lagi");
      return;
    }

    // Hentikan countdown autocomplete jika sedang berjalan
    stopCountdown();
    // Hentikan timeout autocomplete jika sedang berjalan
    stopAutocompleteTimeout();
    // Hentikan timeout input jika sedang berjalan
    stopInputTimeout();
    // Bersihkan predictions
    setPredictions([]);
    // Set flag bahwa sedang dalam proses drag
    setIsDragging(true);

    if (e.latLng !== null) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setLocationMap({ lat: newLat, lng: newLng });

      // Mulai cooldown setelah drag selesai
      startCooldown(10);

      debouncedFetchLocationData(newLat, newLng);
    }

    // Reset flag drag setelah selesai (akan direset setelah 10 detik oleh cooldown)
    setTimeout(() => setIsDragging(false), 100); // Reset setelah 100ms agar tidak mengganggu cooldown
  }

  function clickMap(e: MapMouseEvent) {
    // Cegah click jika dalam masa cooldown
    if (isCooldown) {
      toast.error("Silakan tunggu sebelum melakukan aksi lagi");
      return;
    }

    // Hentikan countdown autocomplete jika sedang berjalan
    stopCountdown();
    // Hentikan timeout autocomplete jika sedang berjalan
    stopAutocompleteTimeout();
    // Hentikan timeout input jika sedang berjalan
    stopInputTimeout();
    // Bersihkan predictions
    setPredictions([]);

    if (e.detail.latLng !== null) {
      const newLat = e.detail.latLng.lat;
      const newLng = e.detail.latLng.lng;
      setLocationMap({ lat: newLat, lng: newLng });

      // Mulai cooldown setelah click map
      startCooldown(10);

      debouncedFetchLocationData(newLat, newLng);
    }
  }

  // useEffect(() => {
  //   // if (long === "" && lat === "") {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;

  //         getLocation(latitude, longitude);
  //         setLocationMap({ lat: latitude, lng: longitude });
  //       },
  //       (error) => {
  //         console.error("Error getting current location:", error);
  //       }
  //     );
  //   } else {
  //     console.error("Geolocation is not supported by this browser.");
  //   }
  // }, []);

  return (
    <div className="col-span-1">
      <label className="text-[#666]">Masukkan Alamat</label>
      <div className="relative mt-2">
        <div className="mb-5 z-10">
          <div className="relative">
            <input
              placeholder="Alamat"
              ref={placeAutoCompleteRef}
              className={`w-full py-2 pl-2 pr-10 border border-[#ccc] text-black max-sm:text-sm rounded shadow-sm ${
                isCooldown ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isCooldown} // Disable input saat dalam cooldown
            />
            {placeAutoCompleteRef.current &&
            placeAutoCompleteRef.current.value ? (
              <FaXmark
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => {
                  if (placeAutoCompleteRef?.current) {
                    placeAutoCompleteRef.current.value = "";
                  }
                  setPredictions([]); // Clear predictions when clearing input
                  stopCountdown(); // Stop countdown when clearing input
                  stopAutocompleteTimeout(); // Stop autocomplete timeout when clearing input
                  stopInputTimeout(); // Stop input timeout when clearing input
                }}
              />
            ) : (
              <IoSearchOutline
                size={20}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              />
            )}
          </div>

          {/* Tampilkan loading dengan countdown */}
          {isLoadingSearch && !isCooldown && (
            <div className="bg-white border-2 rounded-lg px-2 py-2">
              Sedang mencari dalam {countdown}
            </div>
          )}

          {/* Tampilkan cooldown overlay jika dalam masa cooldown */}
          {isCooldown && (
            <div className="bg-white border-2 rounded-lg px-2 py-2">
              Sedang mencari dalam {cooldownCount}
            </div>
          )}

          {!isLoadingSearch &&
            !isCooldown &&
            !isDragging &&
            predictions.length > 0 && (
              <div className="bg-white border-2 rounded-lg px-2 py-2">
                {predictions.map((prediction) => (
                  <div
                    key={prediction.place_id}
                    onClick={() => handlePredictionClick(prediction)}
                    className="cursor-pointer flex gap-2 items-center pb-2"
                  >
                    <div>
                      <FaLocationDot size={20} className="text-orange" />
                    </div>
                    <div>{prediction.description}</div>
                  </div>
                ))}
              </div>
            )}
        </div>
        <div className="relative">
          {/* Tampilkan overlay jika dalam cooldown */}
          {isCooldown && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10 rounded">
              <div className="bg-white p-4 rounded shadow-lg">
                <p className="text-center">
                  Sedang mencari dalam {cooldownCount}
                </p>
              </div>
            </div>
          )}
          <APIProvider
            apiKey={
              process.env.NEXT_PUBLIC_MAP_API_KEY
                ? process.env.NEXT_PUBLIC_MAP_API_KEY
                : ""
            }
          >
            <Maps
              {...cameraProps}
              onCameraChanged={handleCameraChange}
              className="w-full h-[200px]"
              mapTypeControl={false}
              fullscreenControl={false}
              streetViewControl={false}
              // zoomControl={false}
              onClick={clickMap}
            >
              <Marker
                position={locationMap}
                draggable={true}
                icon={customIcon}
                animation={iconAnimation}
                onDragEnd={dragMarker}
              />
            </Maps>
          </APIProvider>
        </div>
      </div>
    </div>
  );
}

export default MapInput;
