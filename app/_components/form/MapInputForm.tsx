// import React, { useCallback, useEffect, useRef, useState } from "react";
// import { FaLocationDot, FaXmark } from "react-icons/fa6";
// import { IoSearchOutline } from "react-icons/io5";
// import {
//   APIProvider,
//   MapCameraChangedEvent,
//   MapCameraProps,
//   MapMouseEvent,
//   Map as Maps,
//   Marker,
// } from "@vis.gl/react-google-maps";
// import { debounce } from "@/app/_shared/utils";
// import { Libraries, useJsApiLoader } from "@react-google-maps/api";
// import toast from "react-hot-toast";
// import { GetListGeocode } from "@/app/_api/Location/Location";

// const libs: Libraries = ["places", "geocoding"];

// function MapInputForm({
//   getAddress,
//   onPlaceChange,
// }: {
//   getAddress: (address: string) => void;
//   onPlaceChange?: (payload: {
//     address: string;
//     raw_result: any;
//     latitude: number;
//     longitude: number;
//   }) => void;
// }) {
//   const placeAutoCompleteRef = useRef<HTMLInputElement | null>(null);

//   const [locationMap, setLocationMap] = useState<any>(null);
//   const [address, setAddress] = useState<any>("");
//   const [latitude, setLatitude] = useState<any>(0);
//   const [longitude, setLongitude] = useState<any>(0);
//   const [rawData, setRawData] = useState<any>(null);
//   const [cameraProps, setCameraProps] = useState<MapCameraProps | null>(null);
//   const [customIcon, setCustomIcon] = useState<any>(null);
//   const [iconAnimation, setIconAnimation] = useState<any>(null);

//   const { isLoaded } = useJsApiLoader({
//     id: "google-map-script",
//     googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY
//       ? process.env.NEXT_PUBLIC_MAP_API_KEY
//       : "",
//     libraries: libs,
//   });

//   useEffect(() => {
//     if (isLoaded) {
//       // ✅ Semua akses ke google.maps dilakukan di sini
//       setCustomIcon({
//         url: "/assets/icon/Pinpoint.webp",
//         scaledSize: new google.maps.Size(40, 40),
//       });
//       setIconAnimation(google.maps.Animation.BOUNCE);
//     }
//   }, [isLoaded]);

//   // State untuk countdown autocomplete
//   const [countdown, setCountdown] = useState<number>(0);
//   const countdownRef = useRef<NodeJS.Timeout | null>(null);

//   // State untuk cooldown drag/click map
//   const [isCooldown, setIsCooldown] = useState<boolean>(false);
//   const [cooldownCount, setCooldownCount] = useState<number>(0); // Countdown untuk cooldown map
//   const cooldownRef = useRef<NodeJS.Timeout | null>(null);

//   // State untuk melacak apakah sedang dalam proses drag
//   const [isDragging, setIsDragging] = useState<boolean>(false);

//   // Tambahkan ref untuk menyimpan timeoutId dari autocomplete
//   const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   // Tambahkan ref untuk menyimpan timeoutId dari input listener
//   const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const startCountdown = useCallback((duration: number = 10) => {
//     if (countdownRef.current) {
//       clearInterval(countdownRef.current);
//     }

//     setCountdown(duration);
//     setIsLoadingSearch(true);

//     countdownRef.current = setInterval(() => {
//       setCountdown((prev) => {
//         if (prev <= 1) {
//           if (countdownRef.current) {
//             clearInterval(countdownRef.current);
//           }
//           setIsLoadingSearch(false);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   }, []);

//   // Fungsi untuk menghentikan countdown autocomplete
//   const stopCountdown = useCallback(() => {
//     if (countdownRef.current) {
//       clearInterval(countdownRef.current);
//       countdownRef.current = null;
//     }
//     setIsLoadingSearch(false);
//     setCountdown(0);
//   }, []);

//   // Fungsi untuk menghentikan timeout autocomplete
//   const stopAutocompleteTimeout = useCallback(() => {
//     if (autocompleteTimeoutRef.current) {
//       clearTimeout(autocompleteTimeoutRef.current);
//       autocompleteTimeoutRef.current = null;
//     }
//   }, []);

//   // Fungsi untuk menghentikan timeout input
//   const stopInputTimeout = useCallback(() => {
//     if (inputTimeoutRef.current) {
//       clearTimeout(inputTimeoutRef.current);
//       inputTimeoutRef.current = null;
//     }
//   }, []);

//   // Fungsi untuk memulai cooldown drag/click map
//   const startCooldown = useCallback((duration: number = 10) => {
//     if (cooldownRef.current) {
//       clearInterval(cooldownRef.current);
//     }

//     setIsCooldown(true);
//     setCooldownCount(duration); // Set initial countdown value

//     cooldownRef.current = setInterval(() => {
//       setCooldownCount((prev) => {
//         if (prev <= 1) {
//           if (cooldownRef.current) {
//             clearInterval(cooldownRef.current);
//           }
//           setIsCooldown(false);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   }, []);

//   useEffect(() => {
//     if (locationMap !== null) {
//       setCameraProps({
//         center: locationMap,
//         zoom: 18,
//       });
//     }
//   }, [locationMap]);

//   useEffect(() => {
//     getAddress(address);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [address]);

//   const [predictions, setPredictions] = useState<
//     google.maps.places.AutocompletePrediction[]
//   >([]);

//   const [isLoadingSearch, setIsLoadingSearch] = useState(false);

//   useEffect(() => {
//     if (isLoaded && placeAutoCompleteRef.current) {
//       const autoCompleteService = new google.maps.places.AutocompleteService();
//       const placesService = new google.maps.places.PlacesService(
//         document.createElement("div"),
//       );

//       let timeoutId: NodeJS.Timeout;

//       placeAutoCompleteRef.current.addEventListener("input", () => {
//         if (isCooldown || isDragging) {
//           setPredictions([]);
//           stopAutocompleteTimeout();
//           return;
//         }

//         const inputValue = placeAutoCompleteRef.current!.value;

//         if (inputValue.length >= 3) {
//           // Hentikan timeout sebelumnya jika ada
//           stopInputTimeout();

//           setPredictions([]); // Clear previous predictions immediately

//           // Hentikan timeout autocomplete sebelumnya jika ada
//           stopAutocompleteTimeout();

//           // Mulai countdown 10 detik
//           startCountdown(10);

//           // Simpan timeoutId ke ref agar bisa diakses dari luar
//           inputTimeoutRef.current = setTimeout(() => {
//             // Ambil predictions setelah countdown selesai
//             autoCompleteService.getPlacePredictions(
//               { input: inputValue, componentRestrictions: { country: "ID" } },
//               (predictions, status) => {
//                 if (
//                   status === google.maps.places.PlacesServiceStatus.OK &&
//                   predictions
//                 ) {
//                   setPredictions(predictions);
//                 } else {
//                   setPredictions([]); // Handle the case where there are no predictions
//                 }
//                 setIsLoadingSearch(false);
//               },
//             );
//           }, 10000); // Tunggu 10 detik sesuai countdown
//         } else {
//           setPredictions([]);
//           stopCountdown();
//           stopAutocompleteTimeout(); // Hentikan timeout autocomplete jika sedang berjalan
//           stopInputTimeout(); // Hentikan timeout input jika sedang berjalan
//         }
//       });

//       placeAutoCompleteRef.current.addEventListener("blur", () => {
//         setTimeout(() => {
//           setPredictions([]);
//           stopCountdown();
//           stopAutocompleteTimeout(); // Hentikan timeout autocomplete jika sedang berjalan
//           stopInputTimeout(); // Hentikan timeout input jika sedang berjalan
//         }, 200); // Delay to allow click event
//       });

//       return () => {
//         stopCountdown();
//         stopAutocompleteTimeout(); // Hentikan timeout autocomplete jika sedang berjalan
//         stopInputTimeout();
//       };
//     }
//   }, [
//     isCooldown,
//     isDragging,
//     isLoaded,
//     startCountdown,
//     stopAutocompleteTimeout,
//     stopCountdown,
//     stopInputTimeout,
//   ]);

//   const handlePredictionClick = (
//     prediction: google.maps.places.AutocompletePrediction,
//   ) => {
//     if (isCooldown) {
//       toast.error("Silakan tunggu sebelum melakukan aksi lagi");
//       return;
//     }

//     stopCountdown();
//     setPredictions([]);
//     stopAutocompleteTimeout(); // Hentikan timeout autocomplete jika sedang berjalan
//     stopInputTimeout();

//     const placesService = new google.maps.places.PlacesService(
//       document.createElement("div"),
//     );
//     const request = {
//       placeId: prediction.place_id,
//       fields: ["name", "formatted_address", "geometry", "address_components"],
//     };

//     placesService.getDetails(request, (place, status) => {
//       if (status === google.maps.places.PlacesServiceStatus.OK && place) {
//         // setSelectedPlace(place);
//         // //console.log(place);

//         const map = {
//           latitude: place.geometry?.location?.lat(),
//           longitude: place.geometry?.location?.lng(),
//           address: place?.name + ", " + place?.formatted_address || "",
//           raw_result: place,
//         };

//         if (placeAutoCompleteRef.current) {
//           placeAutoCompleteRef.current.value =
//             place?.name + ", " + place?.formatted_address || "";

//           setAddress(place?.name + ", " + place?.formatted_address || "");
//           setLatitude(place.geometry?.location?.lat());
//           setLongitude(place.geometry?.location?.lng());
//           setRawData(place);

//           onPlaceChange?.({
//             address: place?.name + ", " + place?.formatted_address || "",
//             raw_result: place,
//             // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
//             latitude: place.geometry?.location?.lat()!,
//             // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
//             longitude: place.geometry?.location?.lng()!,
//           });
//           // setFormData((prevData: any) => ({
//           //   ...prevData,
//           //   long: place.geometry?.location?.lng(),
//           //   lat: place.geometry?.location?.lat(),
//           //   address: place?.name + ", " + place?.formatted_address || "",
//           //   address_gmaps: place,
//           // }));
//         }

//         setLocationMap({
//           lat: place.geometry?.location?.lat(),
//           lng: place.geometry?.location?.lng(),
//         });
//       }
//     });
//   };

//   async function getLocation(lat: any, long: any) {
//     const results = await GetListGeocode({
//       latitude: lat,
//       longitude: long,
//     });
//     // //console.log(results);
//     const map = results?.data?.result?.results[0];

//     const dataLocation = {
//       // latitude: String(map?.geometry?.location?.lat),
//       // longitude: String(map?.geometry?.location?.lng),
//       latitude: String(lat),
//       longitude: String(long),
//       address: map?.formatted_address,
//       raw_result: map,
//     };

//     // setErrors({ ...errors, address_gmaps: "" });
//     if (placeAutoCompleteRef.current) {
//       placeAutoCompleteRef.current.value = map.formatted_address || "";
//     }

//     setAddress(map.formatted_address);
//     setLatitude(lat);
//     setLongitude(long);
//     setRawData(map);

//     onPlaceChange?.({
//       address: map.formatted_address,
//       raw_result: map,
//       latitude: lat,
//       longitude: long,
//     });
//     // setFormData((prevData: any) => ({
//     //   ...prevData,
//     //   long: long,
//     //   lat: lat,
//     //   address: map.formatted_address,
//     //   address_gmaps: map || "",
//     // }));
//   }

//   function dragMarker(e: google.maps.MapMouseEvent) {
//     if (isCooldown) {
//       toast.error("Silakan tunggu sebelum melakukan aksi lagi");
//       return;
//     }

//     // Hentikan countdown autocomplete jika sedang berjalan
//     stopCountdown();
//     // Hentikan timeout autocomplete jika sedang berjalan
//     stopAutocompleteTimeout();
//     // Hentikan timeout input jika sedang berjalan
//     stopInputTimeout();
//     // Bersihkan predictions
//     setPredictions([]);
//     // Set flag bahwa sedang dalam proses drag
//     setIsDragging(true);

//     if (e.latLng !== null) {
//       const newLat = e.latLng.lat();
//       const newLng = e.latLng.lng();
//       setLocationMap({ lat: newLat, lng: newLng });

//       startCooldown(10);

//       debouncedFetchLocationData(newLat, newLng);
//     }

//     setTimeout(() => setIsDragging(false), 100);
//   }

//   function clickMap(e: MapMouseEvent) {
//     // Cegah click jika dalam masa cooldown
//     if (isCooldown) {
//       toast.error("Silakan tunggu sebelum melakukan aksi lagi");
//       return;
//     }

//     // Hentikan countdown autocomplete jika sedang berjalan
//     stopCountdown();
//     // Hentikan timeout autocomplete jika sedang berjalan
//     stopAutocompleteTimeout();
//     // Hentikan timeout input jika sedang berjalan
//     stopInputTimeout();
//     // Bersihkan predictions
//     setPredictions([]);

//     if (e.detail.latLng !== null) {
//       const newLat = e.detail.latLng.lat;
//       const newLng = e.detail.latLng.lng;
//       setLocationMap({ lat: newLat, lng: newLng });

//       // Mulai cooldown setelah click map
//       startCooldown(10);

//       debouncedFetchLocationData(newLat, newLng);
//     }
//   }

//   const handleCameraChange = useCallback(
//     (ev: MapCameraChangedEvent) => setCameraProps(ev.detail),
//     [],
//   );
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const debouncedFetchLocationData = useCallback(
//     debounce(getLocation, 10000),
//     [],
//   );

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;

//           getLocation(latitude, longitude);
//           setLocationMap({ lat: latitude, lng: longitude });
//         },
//         (error) => {
//           console.error("Error getting current location:", error);
//         },
//       );
//     } else {
//       console.error("Geolocation is not supported by this browser.");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="relative">
//       <div className="absolute top-1 z-1 w-[90%] left-[5%]">
//         <div className="relative">
//           <input
//             placeholder="Masukkan Alamat"
//             ref={placeAutoCompleteRef}
//             className={`w-full py-2 pl-2 pr-10 border bg-white border-[#ccc] text-black max-sm:text-sm rounded shadow-sm ${
//               isCooldown ? "opacity-50 cursor-not-allowed!" : ""
//             }`}
//             disabled={isCooldown}
//           />
//           {placeAutoCompleteRef.current &&
//           placeAutoCompleteRef.current.value ? (
//             <FaXmark
//               size={20}
//               className="absolute right-3 top-1/2 -translate-y-1/2"
//               onClick={() => {
//                 if (placeAutoCompleteRef?.current) {
//                   placeAutoCompleteRef.current.value = "";
//                 }
//                 setPredictions([]); // Clear predictions when clearing input
//                 stopCountdown(); // Stop countdown when clearing input
//                 stopAutocompleteTimeout(); // Stop autocomplete timeout when clearing input
//                 stopInputTimeout(); // Stop input timeout when clearing input
//               }}
//             />
//           ) : (
//             <IoSearchOutline
//               size={20}
//               className="absolute right-3 top-1/2 -translate-y-1/2"
//             />
//           )}
//         </div>

//         {isLoadingSearch && !isCooldown && (
//           <div className="bg-white border-2 rounded-lg px-2 py-2">
//             Sedang mencari dalam {countdown}
//           </div>
//         )}

//         {isCooldown && (
//           <div className="bg-white border-2 rounded-lg px-2 py-2">
//             Sedang mencari dalam {cooldownCount}
//           </div>
//         )}

//         {!isLoadingSearch &&
//           !isCooldown &&
//           !isDragging &&
//           predictions.length > 0 && (
//             <div className="bg-white border-2 rounded-lg px-2 py-2">
//               {predictions.map((prediction) => (
//                 <div
//                   key={prediction.place_id}
//                   onClick={() => handlePredictionClick(prediction)}
//                   className="cursor-pointer flex gap-2 items-center pb-2"
//                 >
//                   <div>
//                     <FaLocationDot size={20} className="text-orange" />
//                   </div>
//                   <div>{prediction.description}</div>
//                 </div>
//               ))}
//             </div>
//           )}
//       </div>

//       <div className="relative">
//         {/* Tampilkan overlay jika dalam cooldown */}
//         {isCooldown && (
//           <div className="absolute cursor-not-allowed! inset-0 bg-black/30 flex items-center justify-center z-10 rounded">
//             <div className="bg-white p-4 rounded shadow-lg">
//               <p className="text-center">
//                 Sedang mencari dalam {cooldownCount}
//               </p>
//             </div>
//           </div>
//         )}
//         <APIProvider
//           apiKey={
//             process.env.NEXT_PUBLIC_MAP_API_KEY
//               ? process.env.NEXT_PUBLIC_MAP_API_KEY
//               : ""
//           }
//         >
//           <Maps
//             {...cameraProps}
//             onCameraChanged={handleCameraChange}
//             className="w-full h-100 rounded-xl border border-[#D5D5D5] overflow-hidden"
//             mapTypeControl={false}
//             fullscreenControl={false}
//             streetViewControl={false}
//             // zoomControl={false}
//             onClick={clickMap}
//           >
//             <Marker
//               position={locationMap}
//               draggable={true}
//               // icon={customIcon}
//               animation={iconAnimation}
//               onDragEnd={dragMarker}
//             />
//           </Maps>
//         </APIProvider>
//       </div>
//     </div>
//   );
// }

// export default MapInputForm;
