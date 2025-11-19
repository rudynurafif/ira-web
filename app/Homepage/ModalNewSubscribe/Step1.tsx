// "use client";
// import {
//   getDataCity,
//   getDataPostalCode,
//   getDataProvince,
//   getDataSubDistrict,
//   getDataUserLocation,
//   getDataVillage,
// } from "@/app/_api/Location/Location";
// import React, { FormEvent, useEffect, useState } from "react";
// import DatePicker from "react-datepicker";
// import toast from "react-hot-toast";
// import Select, { StylesConfig } from "react-select";

// import { set } from "react-datepicker/dist/date_utils";
// import MapInput from "./_components/MapInput";
// import moment from "moment";
// import { useRouter } from "next/navigation";
// import {
//   checkCoverage,
//   GetListPackage,
//   registerUser,
//   RequestCoverageUser,
// } from "@/app/_api/Subscribes/Subscribes";
// import { convertToCurrency } from "@/app/_shared/utils";
// import Image from "next/image";
// import checked from "@/public/assets/landing/checked.png";
// import Link from "next/link";

// function Step1({
//   closeModal,
//   changeStep,
//   setCreds,
//   browserId,
// }: {
//   closeModal: () => void;
//   changeStep: (step: number) => void;
//   setCreds: (creds: string) => void;
//   browserId: any;
// }) {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const [packageId, setPackageId] = useState<string>("");
//   const [fullName, setFullName] = useState<string>("");
//   const [phone, setPhone] = useState<string>("");
//   const [email, setEmail] = useState<string>("");
//   const [installationDate, setInstallationDate] = useState<Date | null>(null);
//   const [installationTime, setInstallationTime] = useState<string>("");

//   const [resultCheckCoverage, setResultCheckCoverage] = useState<any>(null);
//   const [fullAddress, setFullAddress] = useState<any>(null);

//   const [province, setProvince] = useState<string>("");
//   const [city, setCity] = useState<string>("");
//   const [subDistrict, setSubDistrict] = useState<string>("");
//   const [village, setVillage] = useState<string>("");
//   const [postal, setPostal] = useState<string>("");
//   const [rw, setRw] = useState<string>("");
//   const [rt, setRt] = useState<string>("");

//   const [termCondition, setTermCondition] = useState<boolean>(false);

//   const [minDate, setMinDate] = useState<Date>(
//     new Date(new Date().setDate(new Date().getDate() + 1))
//   );

//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   const [listProvince, setListProvince] = useState<any[]>([]);
//   const [listCity, setListCity] = useState<any[]>([]);
//   const [listSubDistrict, setListSubDistrict] = useState<any[]>([]);
//   const [listVillage, setListVillage] = useState<any[]>([]);
//   const [listPostalCode, setListPostalCode] = useState<any[]>([]);

//   const [mitraPackage, setMitraPackage] = useState<string>("");
//   const [partnerPackage, setPartnerPackage] = useState<string>("");

//   const [isCoverage, setIsCoverage] = useState<string>("");

//   const [isPackage, setIsPackage] = useState<boolean>(false);
//   const [listPackage, setListPackage] = useState<any[]>([]);
//   const [hoveredPackage, setHoveredPackage] = useState(false);

//   const optionTime = [
//     {
//       label: "Pagi (09.00 - 12.00)",
//       value: "09:00",
//     },
//     {
//       label: "Siang (12.00 - 15.00)",
//       value: "12:00",
//     },
//     {
//       label: "Sore (15.00 - 19.00)",
//       value: "15:00",
//     },
//   ];

//   const selectStylesInstallation: StylesConfig = {
//     control: (styles) => ({
//       ...styles,
//       backgroundColor: "#fbfbfb",
//       borderRadius: "10px",
//       border: `1px solid ${errors.installation_time ? "#FF0000" : "#D5D5D5"}`,
//       padding: "6px 12px 6px 12px",
//     }),
//   };

//   const selectStylesProvince: StylesConfig = {
//     control: (styles) => ({
//       ...styles,
//       backgroundColor: "#fbfbfb",
//       borderRadius: "10px",
//       border: `1px solid ${errors.province ? "#FF0000" : "#D5D5D5"}`,
//       padding: "6px 12px 6px 12px",
//     }),
//   };

//   const selectStylesCity: StylesConfig = {
//     control: (styles) => ({
//       ...styles,
//       backgroundColor: "#fbfbfb",
//       borderRadius: "10px",
//       border: `1px solid ${errors.city ? "#FF0000" : "#D5D5D5"}`,
//       padding: "6px 12px 6px 12px",
//     }),
//   };

//   const selectStylesSubDistrict: StylesConfig = {
//     control: (styles) => ({
//       ...styles,
//       backgroundColor: "#fbfbfb",
//       borderRadius: "10px",
//       border: `1px solid ${errors.subDistrict ? "#FF0000" : "#D5D5D5"}`,
//       padding: "6px 12px 6px 12px",
//     }),
//   };

//   const selectStylesVillage: StylesConfig = {
//     control: (styles) => ({
//       ...styles,
//       backgroundColor: "#fbfbfb",
//       borderRadius: "10px",
//       border: `1px solid ${errors.village ? "#FF0000" : "#D5D5D5"}`,
//       padding: "6px 12px 6px 12px",
//     }),
//   };

//   const selectStylesPostal: StylesConfig = {
//     control: (styles) => ({
//       ...styles,
//       backgroundColor: "#fbfbfb",
//       borderRadius: "10px",
//       border: `1px solid ${errors.postal ? "#FF0000" : "#D5D5D5"}`,
//       padding: "6px 12px 6px 12px",
//     }),
//   };

//   function getCity(data: any) {
//     for (let item of data) {
//       if (item.types.includes("administrative_area_level_2")) {
//         return item.long_name; // Mengembalikan nama kota/kabupaten
//       }
//     }
//     return null; // Jika tidak ditemukan
//   }

//   useEffect(() => {
//     Checkradius();
//   }, [fullAddress]);

//   useEffect(() => {
//     if (mitraPackage) {
//       getPackageList();
//     }
//   }, [fullAddress, mitraPackage]);

//   async function Checkradius() {
//     await checkCoverage(fullAddress).then(
//       (res) => {
//         if (res?.data?.statusCode === 200) {
//           setIsCoverage(res?.data?.result?.inside_coverage);
//           setMitraPackage(
//             res?.data?.result?.mitra_id ? res?.data?.result?.mitra_id : null
//           );
//           setPartnerPackage(
//             res?.data?.result?.sales_partner_id
//               ? res?.data?.result?.sales_partner_id
//               : null
//           );
//         }
//       },
//       (err: any) => {
//         toast.error("Check Coverage Error");
//       }
//     );
//   }

//   async function getPackageList() {
//     try {
//       const city = getCity(fullAddress.raw_result.address_components);

//       const params: any = {
//         city: city,
//         longitude: fullAddress.longitude,
//         latitude: fullAddress.latitude,
//       };

//       if (mitraPackage) {
//         params.mitra_id = mitraPackage;
//       }

//       const res_getListPackage = await GetListPackage(params);

//       if (res_getListPackage?.data?.result.length > 0) {
//         setIsPackage(true);

//         // ambil semua paket
//         setListPackage(res_getListPackage?.data?.result);

//         setPackageId(res_getListPackage?.data?.result[0]?.id);
//       } else {
//         // noPackage();
//         setListPackage([]);
//         setPackageId("");
//         setIsPackage(false);
//       }
//     } catch (error: any) {
//       console.error(error.response);
//       // toast.error("Terjadi kesalahan. Silahkan coba lagi.");
//     }
//   }

//   useEffect(() => {
//     if (fullAddress) {
//       getUserLocation();
//     }
//   }, [fullAddress]);

//   useEffect(() => {
//     getListProvince();
//   }, []);

//   useEffect(() => {
//     if (province) {
//       getListCity();
//     }
//   }, [province]);

//   useEffect(() => {
//     if (city) {
//       getListSubDistrict();
//     }
//   }, [city]);

//   useEffect(() => {
//     if (subDistrict) {
//       getListVillage();
//     }
//   }, [subDistrict]);

//   useEffect(() => {
//     if (subDistrict) {
//       getListPostalCode();
//     }
//   }, [subDistrict]);

//   async function getUserLocation() {
//     try {
//       const body = {
//         address: [fullAddress.raw_result],
//       };

//       const res_getUserLocation = await getDataUserLocation(body);

//       setProvince(
//         res_getUserLocation.data.province
//           ? res_getUserLocation.data.province.id
//           : null
//       );
//       setCity(
//         res_getUserLocation.data.city ? res_getUserLocation.data.city.id : null
//       );
//       setSubDistrict(
//         res_getUserLocation.data.sub_district
//           ? res_getUserLocation.data.sub_district.id
//           : null
//       );
//       setVillage(
//         res_getUserLocation.data.village
//           ? res_getUserLocation.data.village.id
//           : null
//       );
//       setPostal(
//         res_getUserLocation.data.postal_code
//           ? res_getUserLocation.data.postal_code.id
//           : null
//       );
//     } catch (error: any) {
//       toast.error(error.response.data.message);
//     }
//   }

//   async function getListProvince() {
//     try {
//       const res_getListProvince = await getDataProvince();

//       const temp = res_getListProvince.data.result.map((item: any) => {
//         return {
//           label: item.name,
//           value: item.id,
//         };
//       });

//       setListProvince(temp);
//     } catch (error: any) {
//       toast.error(error.response.data.message);
//     }
//   }

//   async function getListCity() {
//     try {
//       const params: any = {
//         province_id: province,
//       };
//       const res_getListCity = await getDataCity(params);

//       const temp = res_getListCity.data.result.map((item: any) => {
//         return {
//           label: item.name,
//           value: item.id,
//         };
//       });

//       setListCity(temp);
//     } catch (error: any) {
//       toast.error(error.response.data.message);
//     }
//   }

//   async function getListSubDistrict() {
//     try {
//       const params: any = {
//         city_id: city,
//       };
//       const res_getListSubDistrict = await getDataSubDistrict(params);

//       const temp = res_getListSubDistrict.data.result.map((item: any) => {
//         return {
//           label: item.name,
//           value: item.id,
//         };
//       });

//       setListSubDistrict(temp);
//     } catch (error: any) {
//       toast.error(error.response.data.message);
//     }
//   }

//   async function getListVillage() {
//     try {
//       const params: any = {
//         sub_district_id: subDistrict,
//       };
//       const res_getListSubDistrict = await getDataVillage(params);

//       const temp = res_getListSubDistrict.data.result.map((item: any) => {
//         return {
//           label: item.name,
//           value: item.id,
//         };
//       });

//       setListVillage(temp);
//     } catch (error: any) {
//       toast.error(error.response.data.message);
//     }
//   }

//   async function getListPostalCode() {
//     try {
//       const params: any = {
//         sub_district_id: subDistrict,
//       };

//       const res_getListPostalCode = await getDataPostalCode(params);

//       const temp = res_getListPostalCode.data.result.map((item: any) => {
//         return {
//           label: item.name,
//           value: item.id,
//         };
//       });

//       setListPostalCode(temp);
//     } catch (error: any) {
//       toast.error(error.response.data.message);
//     }
//   }

//   async function submitRegister(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     setIsLoading(true);
//     const loading = toast.loading("Loading...");

//     const errors: { [key: string]: string } = {};

//     const regexPhone = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;

//     if (!fullName) {
//       errors.name = "Nama harus diisi.";
//     }

//     if (!phone) {
//       errors.phone = "Nomor telepon harus diisi.";
//     } else if (!regexPhone.test(phone)) {
//       errors.phone = "Nomor telepon tidak valid.";
//     }

//     if (!province) {
//       errors.province = "Provinsi harus diisi.";
//     }

//     if (!city) {
//       errors.city = "Kota harus diisi.";
//     }

//     if (!subDistrict) {
//       errors.subDistrict = "Kecamatan harus diisi.";
//     }

//     if (!village) {
//       errors.village = "Desa harus diisi.";
//     }

//     if (Object.keys(errors).length > 0) {
//       setErrors(errors);
//       toast.dismiss(loading);
//       toast.error("Lengkapi data Anda terlebih dahulu.");
//       setIsLoading(false);
//       return;
//     } else {
//       try {
//         if (!termCondition) {
//           toast.error("Mohon setujui syarat dan ketentuan terlebih dahulu.");
//           setIsLoading(false);
//           toast.dismiss(loading);
//           return;
//         }
//         const body: any = {
//           name: fullName,
//           phone_number: phone,
//           email: email ? email : null,
//           actual_address: fullAddress.address,
//           province_id: province,
//           city_id: city,
//           sub_district_id: subDistrict,
//           village_id: village,
//           postal_code_id: postal ? postal : null,
//           rt: rt ? rt : null,
//           rw: rw ? rw : null,
//           est_request_datetime:
//             installationDate && installationTime
//               ? moment(installationDate).format("YYYY-MM-DD") +
//                 "T" +
//                 installationTime
//               : null,
//           address: [fullAddress.raw_result],
//           regional_package_id: packageId,
//         };

//         if (browserId) {
//           body.browser_id = browserId;
//         }

//         if (partnerPackage) {
//           body.sales_partner_id = partnerPackage;
//         }

//         // api
//         if (isCoverage) {
//           const res_register = await registerUser(body);
//           toast.dismiss(loading);

//           router.push(`/thank-you?creds=${phone}`);
//         } else {
//           body.latitude = fullAddress.latitude;
//           body.longitude = fullAddress.longitude;

//           const res_requestCoverage = await RequestCoverageUser(body);
//           toast.dismiss(loading);
//           setCreds(phone);
//           changeStep(2);
//         }
//       } catch (error: any) {
//         toast.dismiss(loading);
//         toast.error(error.response.data.message);
//         setIsLoading(false);
//       }
//     }
//   }

//   const handleMouseEnter = () => {
//     setHoveredPackage(true);
//   };

//   const handleMouseLeave = () => {
//     setHoveredPackage(false);
//   };

//   return (
//     <div className="h-full md:max-h-[90vh] overflow-auto p-10 max-md:h-screen">
//       <h1 className="text-[#003D76] text-lg sm:text-2xl font-bold mb-5 pb-5 border-b border-gray-300">
//         Silahkan Isi Data Anda
//       </h1>
//       <form onSubmit={submitRegister}>
//         {listPackage.length > 1 && (
//           <div className="mb-[50px]">
//             <h3 className="text-[#003D76] text-lg sm:text-xl font-semibold mb-[15px]">
//               Pilih Paket
//             </h3>
//             <div className="grid md:grid-cols-2 grid-cols-1 gap-5 items-center">
//               {listPackage.map((item: any, index: number) => {
//                 return (
//                   <div
//                     className="col-span-1 cursor-pointer"
//                     onClick={() => {
//                       setPackageId(item.id);
//                     }}
//                     onMouseEnter={handleMouseEnter}
//                     onMouseLeave={handleMouseLeave}
//                     key={"package-" + index}
//                   >
//                     <div
//                       className={`rounded-xl shadow-lg ${
//                         packageId === item.id
//                           ? "bg-[#084C94] text-white"
//                           : "bg-[#F7F9FD] text-[#003D76] border border-[#D5D5D5]"
//                       }`}
//                     >
//                       {/* header */}
//                       <div className="px-4">
//                         <div
//                           className={`py-3  border-b ${
//                             packageId === item.id
//                               ? "border-white"
//                               : "border-[#003D76]"
//                           } font-semibold text-sm min-[400px]:text-base sm:text-lg flex justify-between items-center gap-3`}
//                         >
//                           {item.package_id?.name}
//                           <div>
//                             {packageId === item.id ? (
//                               <Image
//                                 src={checked}
//                                 alt="checked"
//                                 className="w-5 h-5"
//                               />
//                             ) : (
//                               <div className="w-5 h-5 rounded-full border-2 border-[#003D76]"></div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       {/* body */}
//                       <div className="py-3 px-4">
//                         <div className="flex min-[400px]:flex-row flex-col gap-5 justify-between items-center">
//                           <div className="flex items-start">
//                             <div className="text-[8px] sm:text-xs text-nowrap">
//                               Up To
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <div className="text-4xl sm:text-6xl md:text-5xl font-black">
//                                 {parseInt(item.speed_up_to)}
//                               </div>
//                               <div>
//                                 <p className="text-sm font-bold">
//                                   {item.speed_up_to.split(" ")[1]}
//                                 </p>
//                                 <p className="text-[10px]">
//                                   Unlimited
//                                   <br />
//                                   Kuota
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                           <div
//                             className={`border ${
//                               packageId === item.id
//                                 ? "border-white"
//                                 : "border-[#003D76]"
//                             }  text-xs sm:text-base md:text-xs lg:text-sm font-medium px-2 py-1.5 rounded-lg`}
//                           >
//                             {convertToCurrency(item.price)}/bulan
//                             {/* {convertToCurrency(250000)}/bulan */}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//                 // }
//               })}
//             </div>
//           </div>
//         )}
//         <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-x-2.5 gap-y-5">
//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="name">
//               Nama Lengkap
//             </label>
//             <input
//               name="name"
//               id="name"
//               type="text"
//               disabled={isLoading}
//               className={`bg-[#fbfbfb] rounded-xl border text-black w-full py-3 px-5 mt-2 ${
//                 errors.name ? "border-red-500" : "border-[#D5D5D5]"
//               }`}
//               placeholder="Nama Lengkap Kamu"
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//             />
//             {errors.name && (
//               <p className="text-sm text-red-500">{errors.name}</p>
//             )}
//           </div>
//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="phone">
//               Nomor Telepon
//             </label>
//             <input
//               name="phone"
//               id="phone"
//               disabled={isLoading}
//               type="text"
//               className={`bg-[#fbfbfb] rounded-xl border text-black w-full py-3 px-5 mt-2 ${
//                 errors.phone ? "border-red-500" : "border-[#D5D5D5]"
//               }`}
//               placeholder="08xxxxxxxx"
//               value={phone}
//               onChange={(e) => {
//                 // Mengambil nilai input
//                 const value = e.target.value;

//                 // Hanya set nilai jika input adalah angka
//                 if (/^\d*$/.test(value)) {
//                   setPhone(value);
//                 }
//               }}
//             />
//             {errors.phone && (
//               <p className="text-sm text-red-500">{errors.phone}</p>
//             )}
//           </div>
//           <div className="col-span-1 md:col-span-2">
//             <label className="text-[#666]" htmlFor="email">
//               Email {"("}Opsional{")"}
//             </label>
//             <input
//               name="email"
//               id="email"
//               type="text"
//               disabled={isLoading}
//               className={`bg-[#fbfbfb] rounded-xl border text-black w-full py-3 px-5 mt-2 ${
//                 errors.email ? "border-red-500" : "border-[#D5D5D5]"
//               }`}
//               placeholder="emailkamu@domain.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             {errors.email && (
//               <p className="text-sm text-red-500">{errors.email}</p>
//             )}
//           </div>
//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="installation_date">
//               Jadwal Tanggal Pemasangan {"("}Opsional{")"}
//             </label>

//             <div className="w-full">
//               <DatePicker
//                 selected={installationDate}
//                 onChange={(date: any) => setInstallationDate(date)}
//                 minDate={minDate}
//                 isClearable
//                 className={`bg-[#fbfbfb] rounded-xl border text-black w-full py-3 px-5 mt-2 relative z-30 ${
//                   errors.installation_date
//                     ? "border-red-500"
//                     : "border-[#D5D5D5]"
//                 }`}
//                 placeholderText="Pilih Tanggal"
//               />
//             </div>
//             {errors.installation_date && (
//               <p className="text-sm text-red-500">{errors.installation_date}</p>
//             )}
//           </div>

//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="installation_date">
//               Jadwal Jam Pemasangan {"("}Opsional{")"}
//             </label>

//             <Select
//               options={optionTime}
//               styles={selectStylesInstallation}
//               id="installation_time"
//               placeholder="Pilih Jam Pemasangan"
//               value={optionTime.find(
//                 (item) => item.value.toString() === installationTime
//               )}
//               onChange={(e: any) => setInstallationTime(e.value)}
//               className="z-40 mt-2"
//             />

//             {errors.installation_time && (
//               <p className="text-sm text-red-500">{errors.installation_time}</p>
//             )}
//           </div>

//           <div className="col-span-1 md:col-span-2">
//             <MapInput
//               setCheckResult={(res: any) => {
//                 setResultCheckCoverage(res);
//               }}
//               setFullAddress={(add: any) => {
//                 setFullAddress(add);
//               }}
//             />
//           </div>

//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="province">
//               Provinsi
//             </label>

//             <Select
//               options={listProvince}
//               styles={selectStylesProvince}
//               id="province"
//               placeholder="Pilih Provinsi"
//               value={listProvince.find((item) => item.value === province)}
//               isClearable
//               onChange={(e: any) => {
//                 if (e) {
//                   setProvince(e.value);
//                   setCity("");
//                   setSubDistrict("");
//                   setVillage("");
//                   setPostal("");
//                 } else {
//                   setProvince("");
//                   setCity("");
//                   setSubDistrict("");
//                   setVillage("");
//                   setPostal("");
//                 }
//               }}
//               className="z-[50] mt-2"
//             />

//             {errors.province && (
//               <p className="text-sm text-red-500">{errors.province}</p>
//             )}
//           </div>

//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="city">
//               Kota / Kabupaten
//             </label>

//             <Select
//               options={listCity}
//               styles={selectStylesCity}
//               id="city"
//               placeholder="Pilih Kota / Kabupaten"
//               isClearable
//               isDisabled={!province}
//               value={city ? listCity.find((item) => item.value === city) : null}
//               onChange={(e: any) => {
//                 if (e) {
//                   setCity(e.value);
//                   setSubDistrict("");
//                   setVillage("");
//                   setPostal("");
//                 } else {
//                   setCity("");
//                   setSubDistrict("");
//                   setVillage("");
//                   setPostal("");
//                 }
//               }}
//               className="z-[49] mt-2"
//             />

//             {errors.city && (
//               <p className="text-sm text-red-500">{errors.city}</p>
//             )}
//           </div>

//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="subDistrict">
//               Kecamatan
//             </label>

//             <Select
//               options={listSubDistrict}
//               styles={selectStylesSubDistrict}
//               id="subDistrict"
//               placeholder="Pilih Kecamatan"
//               isClearable
//               isDisabled={!city}
//               value={
//                 subDistrict
//                   ? listSubDistrict.find((item) => item.value === subDistrict)
//                   : null
//               }
//               onChange={(e: any) => {
//                 if (e) {
//                   setSubDistrict(e.value);
//                   setVillage("");
//                   setPostal("");
//                 } else {
//                   setSubDistrict("");
//                   setVillage("");
//                   setPostal("");
//                 }
//               }}
//               className="z-[48] mt-2"
//             />

//             {errors.subDistrict && (
//               <p className="text-sm text-red-500">{errors.subDistrict}</p>
//             )}
//           </div>

//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="village">
//               Desa / Kelurahan
//             </label>

//             <Select
//               options={listVillage}
//               styles={selectStylesVillage}
//               isClearable
//               isDisabled={!subDistrict}
//               id="village"
//               placeholder="Pilih Desa / Kelurahan"
//               value={
//                 village
//                   ? listVillage.find((item) => item.value === village)
//                   : null
//               }
//               onChange={(e: any) => {
//                 if (e) {
//                   setVillage(e.value);
//                 } else {
//                   setVillage("");
//                 }
//               }}
//               className="z-[47] mt-2"
//             />

//             {errors.village && (
//               <p className="text-sm text-red-500">{errors.village}</p>
//             )}
//           </div>

//           <div className="col-span-1">
//             <label className="text-[#666]" htmlFor="postal">
//               Kode Pos {"("}Opsional{")"}
//             </label>

//             <Select
//               options={listPostalCode}
//               styles={selectStylesPostal}
//               id="postal"
//               isClearable
//               isDisabled={!subDistrict}
//               placeholder="Pilih Kode Pos"
//               value={
//                 postal
//                   ? listPostalCode.find((item) => item.value === postal)
//                   : null
//               }
//               onChange={(e: any) => {
//                 if (e) {
//                   setPostal(e.value);
//                 } else {
//                   setPostal("");
//                 }
//               }}
//               className="z-[46] mt-2"
//             />

//             {errors.postalCode && (
//               <p className="text-sm text-red-500">{errors.postalCode}</p>
//             )}
//           </div>
//           <div className="col-span-1">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2.5 gap-y-5">
//               <div className="col-span-1">
//                 <label className="text-[#666]" htmlFor="rw">
//                   RW {"("}Opsional{")"}
//                 </label>
//                 <input
//                   name="rw"
//                   id="rw"
//                   type="text"
//                   disabled={isLoading}
//                   className={`bg-[#fbfbfb] rounded-xl border text-black w-full py-3 px-5 mt-2 ${
//                     errors.rw ? "border-red-500" : "border-[#D5D5D5]"
//                   }`}
//                   placeholder="1"
//                   value={rw}
//                   onChange={(e) => setRw(e.target.value)}
//                 />
//                 {errors.rw && (
//                   <p className="text-sm text-red-500">{errors.rw}</p>
//                 )}
//               </div>
//               <div className="col-span-1">
//                 <label className="text-[#666]" htmlFor="rt">
//                   RT {"("}Opsional{")"}
//                 </label>
//                 <input
//                   name="rt"
//                   id="rt"
//                   type="text"
//                   disabled={isLoading}
//                   className={`bg-[#fbfbfb] rounded-xl border text-black w-full py-3 px-5 mt-2 ${
//                     errors.rt ? "border-red-500" : "border-[#D5D5D5]"
//                   }`}
//                   placeholder="1"
//                   value={rt}
//                   onChange={(e) => setRt(e.target.value)}
//                 />
//                 {errors.rt && (
//                   <p className="text-sm text-red-500">{errors.rt}</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-2 items-center mt-5">
//           <input
//             type="checkbox"
//             className="w-[20px] h-[20px]"
//             id="termCondition"
//             checked={termCondition}
//             onChange={() => setTermCondition(!termCondition)}
//           />
//           <label htmlFor="termCondition">
//             Saya telah setuju dengan{" "}
//             <span>
//               <Link
//                 href={"/terms-and-condition"}
//                 className="text-blue hover:underline"
//                 target="_blank"
//               >
//                 syarat dan ketentuan berlangganan
//               </Link>
//               .
//             </span>
//           </label>
//         </div>

//         <div className="flex justify-between items-end mt-5 gap-5">
//           <button
//             type="button"
//             disabled={isLoading}
//             className={`py-4 px-6 sm:px-8 rounded-xl font-bold border sm:text-base text-sm  ${
//               isLoading
//                 ? "border-slate-400 bg-slate-400 text-white"
//                 : "border-[#FF9500] bg-white text-[#FF9500]"
//             }`}
//             onClick={closeModal}
//           >
//             Batal
//           </button>
//           <button
//             className={`${
//               isLoading ? "bg-[#FFD8A8]" : "bg-[#FF9500]"
//             } text-white py-4 px-6 sm:px-8 rounded-xl font-bold sm:text-base text-sm`}
//             type="submit"
//             disabled={isLoading}
//             id="button-register"
//           >
//             {isLoading ? (
//               <div className="flex items-center gap-2.5">
//                 <div
//                   className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-[#FF9500] motion-reduce:animate-[spin_1.5s_linear_infinite]"
//                   role="status"
//                 >
//                   <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
//                     Loading...
//                   </span>
//                 </div>
//                 Loading...
//               </div>
//             ) : (
//               "Daftar"
//             )}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default Step1;
