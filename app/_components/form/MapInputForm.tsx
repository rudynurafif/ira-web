import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaLocationDot, FaXmark } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import {
  APIProvider,
  MapCameraChangedEvent,
  MapCameraProps,
  Map as Maps,
  Marker,
} from "@vis.gl/react-google-maps";
import { debounce } from "@/app/_shared/utils";
import { GetListGeocode } from "@/app/_api/Maps/Maps";
import { Libraries, useJsApiLoader } from "@react-google-maps/api";

const libs: Libraries = ["places", "geocoding"];

function MapInputForm({
  getAddress,
  onPlaceChange,
}: {
  getAddress: (address: string) => void;
  onPlaceChange?: (payload: {
    address: string;
    raw_result: any;
    latitude: number;
    longitude: number;
  }) => void;
}) {
  const placeAutoCompleteRef = useRef<HTMLInputElement | null>(null);

  const [locationMap, setLocationMap] = useState<any>(null);
  const [address, setAddress] = useState<any>("");
  const [latitude, setLatitude] = useState<any>(0);
  const [longitude, setLongitude] = useState<any>(0);
  const [rawData, setRawData] = useState<any>(null);

  const [cameraProps, setCameraProps] = useState<MapCameraProps | null>(null);

  useEffect(() => {
    if (locationMap !== null) {
      setCameraProps({
        center: locationMap,
        zoom: 18,
      });
    }
  }, [locationMap]);

  useEffect(() => {
    getAddress(address);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);

  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY
      ? process.env.NEXT_PUBLIC_MAP_API_KEY
      : "",
    libraries: libs,
  });

  useEffect(() => {
    if (isLoaded && placeAutoCompleteRef.current) {
      const autoCompleteService = new google.maps.places.AutocompleteService();
      const placesService = new google.maps.places.PlacesService(
        document.createElement("div")
      );

      let timeoutId: NodeJS.Timeout;

      placeAutoCompleteRef.current.addEventListener("input", () => {
        const inputValue = placeAutoCompleteRef.current!.value;

        if (inputValue.length >= 3) {
          clearTimeout(timeoutId);
          setIsLoadingSearch(true);
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
                setIsLoadingSearch(false);
              }
            );
          }, 3000);
        } else {
          setPredictions([]);
        }
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
        // setSelectedPlace(place);
        // //console.log(place);

        const map = {
          latitude: place.geometry?.location?.lat(),
          longitude: place.geometry?.location?.lng(),
          address: place?.name + ", " + place?.formatted_address || "",
          raw_result: place,
        };

        if (placeAutoCompleteRef.current) {
          placeAutoCompleteRef.current.value =
            place?.name + ", " + place?.formatted_address || "";

          setAddress(place?.name + ", " + place?.formatted_address || "");
          setLatitude(place.geometry?.location?.lat());
          setLongitude(place.geometry?.location?.lng());
          setRawData(place);

          onPlaceChange?.({
            address: place?.name + ", " + place?.formatted_address || "",
            raw_result: place,
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            latitude: place.geometry?.location?.lat()!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            longitude: place.geometry?.location?.lng()!,
          });
          // setFormData((prevData: any) => ({
          //   ...prevData,
          //   long: place.geometry?.location?.lng(),
          //   lat: place.geometry?.location?.lat(),
          //   address: place?.name + ", " + place?.formatted_address || "",
          //   address_gmaps: place,
          // }));
        }

        setLocationMap({
          lat: place.geometry?.location?.lat(),
          lng: place.geometry?.location?.lng(),
        });
      }
    });
  };

  async function getLocation(lat: any, long: any) {
    const results = await GetListGeocode({
      latitude: lat,
      longitude: long,
    });
    // //console.log(results);
    const map = results?.data?.result?.results[0];

    const dataLocation = {
      // latitude: String(map?.geometry?.location?.lat),
      // longitude: String(map?.geometry?.location?.lng),
      latitude: String(lat),
      longitude: String(long),
      address: map?.formatted_address,
      raw_result: map,
    };

    // setErrors({ ...errors, address_gmaps: "" });
    if (placeAutoCompleteRef.current) {
      placeAutoCompleteRef.current.value = map.formatted_address || "";
    }

    setAddress(map.formatted_address);
    setLatitude(lat);
    setLongitude(long);
    setRawData(map);

    onPlaceChange?.({
      address: map.formatted_address,
      raw_result: map,
      latitude: lat,
      longitude: long,
    });
    // setFormData((prevData: any) => ({
    //   ...prevData,
    //   long: long,
    //   lat: lat,
    //   address: map.formatted_address,
    //   address_gmaps: map || "",
    // }));
  }

  function dragMarker(e: google.maps.MapMouseEvent) {
    // //console.log(e);

    if (e.latLng !== null) {
      // //console.log(e.latLng.lat());
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setLocationMap({ lat: newLat, lng: newLng });
      debouncedFetchLocationData(newLat, newLng);

      // const formattedAddress = results[0].formatted_address;
      // setFormattedPlace(formattedAddress);
    }
  }

  const handleCameraChange = useCallback(
    (ev: MapCameraChangedEvent) => setCameraProps(ev.detail),
    []
  );
  const debouncedFetchLocationData = useCallback(
    debounce(getLocation, 2000),
    []
  );

  useEffect(() => {
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
  }, []);

  return (
    <div className="relative">
      <div className="absolute top-1 z-1 w-[90%] left-[5%]">
        <div className="relative">
          <input
            placeholder="Masukkan Alamat"
            ref={placeAutoCompleteRef}
            className="w-full py-2 pl-2 pr-10 border border-[#ccc] bg-white text-black max-sm:text-sm rounded shadow-sm"
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
              }}
            />
          ) : (
            <IoSearchOutline
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            />
          )}
        </div>

        {isLoadingSearch && (
          <div className="bg-white border-2 rounded-lg px-2 py-2">
            Loading...
          </div>
        )}

        {!isLoadingSearch && predictions.length > 0 && (
          <div className="bg-white border-2 rounded-lg px-2 py-2">
            {predictions.map((prediction) => (
              <div
                key={prediction.place_id}
                onClick={() => handlePredictionClick(prediction)}
                className="cursor-pointer flex gap-2 items-center pb-2"
              >
                <div>
                  <FaLocationDot size={20} className="text-starlite" />
                </div>
                <div>{prediction.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isLoaded && (
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
            className="w-full h-[400px] rounded-[12px] border border-[#D5D5D5] overflow-hidden"
            mapTypeControl={false}
            fullscreenControl={false}
            streetViewControl={false}
            onClick={(e) => {
              // // //console.log(e);

              setLocationMap({
                lat: e.detail.latLng?.lat,
                lng: e.detail.latLng?.lng,
              });

              debouncedFetchLocationData(
                e.detail.latLng?.lat,
                e.detail.latLng?.lng
              );
            }}
          >
            <Marker
              position={locationMap}
              draggable={true}
              onDragEnd={dragMarker}
              // icon={{
              //   url: "/assets/icon/icon-pinpoint.webp",
              //   scaledSize: new window.google.maps.Size(40, 40), // Ukuran marker
              // }}
              animation={window.google.maps.Animation.BOUNCE}
            />
          </Maps>
        </APIProvider>
      )}
    </div>
  );
}

export default MapInputForm;
