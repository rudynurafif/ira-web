"use client";
import React, { useEffect, useRef, useState } from "react";

import backgroundCheckCoverage from "@/public/assets/check-coverage/backgound-check-coverage.webp";
import Image from "next/image";
import Select, { StylesConfig } from "react-select";
import { FaCircleXmark, FaLocationDot, FaXmark } from "react-icons/fa6";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";
import toast from "react-hot-toast";
import ModalCheckCoverage from "./ModalCheckCoverage";
import ModalTemplate from "@/app/_components/modal/ModalTemplate";
import { getCheckCoverage } from "@/app/_api/Location/Location";

const libs: Libraries = ["places", "geocoding"];

function CheckCoverage() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY
      ? process.env.NEXT_PUBLIC_MAP_API_KEY
      : "",
    libraries: libs,
  });

  const placeAutoCompleteRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]); // Ensure state is typed correctly

  const [modalResult, setModalResult] = useState<boolean>(false);

  const [isCoverage, setIsCoverage] = useState<boolean>(false);
  const [mitraPaket, setMitraPaket] = useState<string | null>(null);

  const [dataChooseMap, setDataChooseMap] = useState<any>();

  const [listProvinsi, setListProvinsi] = useState<any[]>([
    { value: "provinsi 1", label: "Provinsi 1" },
    { value: "provinsi 2", label: "Provinsi 2" },
    { value: "provinsi 3", label: "Provinsi 3" },
    { value: "provinsi 4", label: "Provinsi 4" },
  ]);
  const [listKota, setListKota] = useState<any[]>([
    { value: "kota 1", label: "Kota 1" },
    { value: "kota 2", label: "Kota 2" },
    { value: "kota 3", label: "Kota 3" },
    { value: "kota 4", label: "Kota 4" },
  ]);
  const [listKecamatan, setListKecamatan] = useState<any[]>([
    { value: "kecamatan 1", label: "Kecamatan 1" },
    { value: "kecamatan 2", label: "Kecamatan 2" },
    { value: "kecamatan 3", label: "Kecamatan 3" },
    { value: "kecamatan 4", label: "Kecamatan 4" },
  ]);
  const [listKelurahan, setListKelurahan] = useState<any[]>([
    { value: "kelurahan 1", label: "Kelurahan 1" },
    { value: "kelurahan 2", label: "Kelurahan 2" },
    { value: "kelurahan 3", label: "Kelurahan 3" },
    { value: "kelurahan 4", label: "Kelurahan 4" },
  ]);

  const [provinsi, setProvinsi] = useState<string>("");
  const [kota, setKota] = useState<string>("");
  const [kecamatan, setKecamatan] = useState<string>("");
  const [kelurahan, setKelurahan] = useState<string>("");

  const selectStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      backgroundColor: "#fbfbfb",
      borderRadius: "10px",
      padding: "6px 12px 6px 12px",
    }),
  };

  useEffect(() => {
    if (isLoaded && placeAutoCompleteRef.current) {
      const autoCompleteService = new google.maps.places.AutocompleteService();
      const placesService = new google.maps.places.PlacesService(
        document.createElement("div")
      );

      let timeoutId: NodeJS.Timeout;

      placeAutoCompleteRef.current.addEventListener("input", () => {
        const inputValue = placeAutoCompleteRef.current!.value;

        // Reset delay state

        if (inputValue.length >= 3) {
          clearTimeout(timeoutId);
          setIsLoading(true);
          timeoutId = setTimeout(() => {
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
                setIsLoading(false);
              }
            );
          }, 3000); // Delay 3 detik
          // setIsLoading(false);
        } else {
          setPredictions([]);
          // setIsLoading(false);
        }
        // setTimeout(() => setIsLoading(false), 5000);
      });

      placeAutoCompleteRef.current.addEventListener("blur", () => {
        setTimeout(() => setPredictions([]), 200); // Delay to allow click event
      });

      return () => {
        clearTimeout(timeoutId); // Bersihkan timeout saat komponen di-unmount
      };
    }
  }, [isLoaded]);

  const handlePredictionClick = (
    prediction: google.maps.places.AutocompletePrediction
  ) => {
    const placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );
    const request = {
      placeId: prediction.place_id,
      fields: ["name", "formatted_address", "geometry", "address_components"],
    };

    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        if (placeAutoCompleteRef.current) {
          placeAutoCompleteRef.current.value =
            place?.name + ", " + place?.formatted_address || "";
        }

        setDataChooseMap({
          location: place?.name + ", " + place?.formatted_address,
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
          rawData: place,
        });

        // addUrlParam("lat", place.geometry?.location?.lat());
        // addUrlParam("long", place.geometry?.location?.lng());
      }
    });
  };

  async function Checkradius() {
    setIsLoading(true);

    if (!dataChooseMap) {
      setIsLoading(false);
      toast.error("Lokasi Belum Terpilih, Harap Pilih Lokasi Terlebih Dahulu.");
      return;
    }

    const payload = {
      latitude: String(dataChooseMap?.lat),
      longitude: String(dataChooseMap?.lng),
      address: dataChooseMap?.location,
      raw_result: dataChooseMap?.rawData,
    };

    await getCheckCoverage(payload).then(
      (res) => {
        // if (res?.data?.statusCode === 200) {
        //   updateStep(3);
        //   isCoverage(res?.data?.result?.inside_coverage);
        // }

        setIsCoverage(res.data.result.inside_coverage);
        setMitraPaket(
          res.data.result.mitra_id ? res.data.result.mitra_id : null
        );

        setModalResult(true);
        setIsLoading(false);
      },
      (err: any) => {
        // console.error(err.response.data.message);
        setIsLoading(false);
        toast.error("Check Coverage Error");
      }
    );
  }

  return (
    <div className="sm:bg-[url(/assets/check-coverage/background-check-coverage.png)] bg-[url(/assets/check-coverage/background-coverage-mobile.png)] bg-cover bg-no-repeat py-52 px-[5%] min-[1261px]:px-[10%]">
      <div className="w-full flex justify-center">
        <h1 className="text-center text-white text-3xl/[120%] sm:text-4xl/[120%] md:text-5xl/[120%] xl:text-[52px]/[120%] font-bold w-full lg:w-3/5">
          Apakah area Anda berada dalam jangkauan starlite?
        </h1>
      </div>
      <p className="text-center text-white mt-[30px] text-base sm:text-xl md:text-2xl">
        Yuk, cek alamat Anda di sini!
      </p>
      <div className="flex flex-col sm:flex-row gap-5 items-center mt-7 xl:w-3/5 lg:w-4/5 w-full mx-auto">
        <div className="w-full sm:w-4/5 md:w-3/5 relative">
          <input
            type="text"
            ref={placeAutoCompleteRef}
            onChange={() => {
              setDataChooseMap(null);
            }}
            placeholder="Masukkan alamat Anda"
            className="text-base bg-white sm:text-lg md:text-xl px-6 py-4 w-full rounded-xl"
          />

          {placeAutoCompleteRef.current?.value && (
            <button
              type="button"
              onClick={() => {
                if (placeAutoCompleteRef.current) {
                  placeAutoCompleteRef.current.value = "";
                }
                setDataChooseMap(null);
                setPredictions([]); // bersihkan prediksi
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <FaCircleXmark
                className="cursor-pointer bg-white"
                color="#d7201d"
                size={28}
              />
            </button>
          )}

          {isLoading && (
            <div className="border-2 rounded-lg px-2 py-2 w-full block absolute z-50 bg-white">
              Loading...
            </div>
          )}
          {!isLoading && predictions.length > 0 && (
            <div className="border-2 rounded-lg px-2 py-2 absolute z-50 bg-white">
              {predictions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  onClick={() => handlePredictionClick(prediction)}
                  className="cursor-pointer max-sm:text-xs text-sm  flex gap-2 items-start pb-2"
                >
                  <div>
                    <FaLocationDot size={20} className="text-[#d7201d]" />
                  </div>
                  <div className="text-dark-primary">
                    {prediction.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-full sm:w-1/5 md:w-2/5">
          <button
            type="button"
            onClick={Checkradius}
            disabled={!dataChooseMap}
            className={`px-6 py-4 text-white ${
              dataChooseMap
                ? "bg-linear-to-b from-[#9C1816] to-[#D7201D] shadow-lg border border-white"
                : "bg-slate-500"
            } font-semibold cursor-pointer hover:bg-primary rounded-xl text-base sm:text-xl text-center w-full`}
          >
            Cek Ketersediaan
          </button>
        </div>
      </div>
      {modalResult && (
        <div className="p-6">
          <ModalTemplate
            closeModal={() => setModalResult(false)}
            classNameModal="max-w-full w-[900px] max-md:!rounded-none"
          >
            <ModalCheckCoverage
              statusCoverage={isCoverage}
              mitraPaket={mitraPaket}
              address={dataChooseMap}
              closeModal={() => setModalResult(false)}
            />
          </ModalTemplate>
        </div>
      )}
    </div>
  );
}

export default CheckCoverage;
