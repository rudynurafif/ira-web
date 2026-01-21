// "use client";

// import Image from "next/image";
// import React, { use, useEffect, useState } from "react";
// import { getCustomerPackage } from "@/app/_api/Customer/CustomerArea";
// import { useRouter } from "next/navigation";
// import SkeletonLoadingCard from "@/app/_components/SkeletonLoadingCard";
// import { useAppSelector } from "@/app/store/store";
// import bannerPanduan from "@/public/assets/Images/bannerPanduan.png";
// import bannerPanduanMobile from "@/public/assets/Images/bannerPanduangmobile.png";
// import bannerCS from "@/public/assets/Images/bannerCS.png";
// import bannerCSMobile from "@/public/assets/Images/bannerCSmobile.png";
// import ActivePackageCard from "./ActivePackageCard";
// import SubsHistoryCard from "./SubsHistoryCard";
// import { SubscriptionHistoryAPI } from "@/app/_shared/types/payment";
// import { toastErrorFromAPI } from "@/app/_shared/utils";
// import empty from "@/public/assets/Images/Empty.svg";
// import Link from "next/link";
// import HistorySection from "./HistorySection";

// const PAGE_SIZE = 5;

// const ActivePacket = () => {
//   const [activePacketData, setActivePacketData] =
//     useState<SubscriptionHistoryAPI | null>(null);
//   const [subscriptionHistory, setSubscriptionHistory] = useState<
//     SubscriptionHistoryAPI[]
//   >([]);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isLoadingHistory, setIsLoadingHistory] = useState(true);

//   const { userInfo } = useAppSelector((state) => state.auth);
//   const router = useRouter();
//   const phoneCS = process.env.NEXT_PUBLIC_PHONE_CS || "6281110689111";
//   const [isUserActive, setIsUserActive] = useState(false);

//   useEffect(() => {
//     if (userInfo?.status === "active" || userInfo?.is_active) {
//       setIsUserActive(true);
//     } else {
//       setIsUserActive(false);
//     }
//   }, [userInfo?.is_active, userInfo?.status]);

//   // Ambil hanya paket aktif dari subHistory (indeks 0)
//   useEffect(() => {
//     // console.log("sub history: ", subscriptionHistory);
//     if (subscriptionHistory?.[0] && userInfo?.status === "active") {
//       // console.log(subscriptionHistory?.[0]);
//       // Cek apakah ini paket aktif (ada start_date dan belum expired)
//       const isActive =
//         subscriptionHistory[0]?.start_date && subscriptionHistory[0]?.end_date;
//       setActivePacketData(isActive ? subscriptionHistory?.[0] : null);
//     }
//   }, [subscriptionHistory, userInfo?.status]);

//   const isFetching = !userInfo;
//   if (isFetching) return <SkeletonLoadingCard />;

//   return (
//     <>
//       {/* MOBILE (< sm) */}
//       <div className="sm:hidden space-y-6">
//         {activePacketData && <ActivePackageCard data={activePacketData} />}

//         <Image
//           src={bannerCSMobile}
//           alt="banner CS"
//           className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
//           onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
//         />

//         <Image
//           src={bannerPanduanMobile}
//           alt="Banner Panduan"
//           className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
//           onClick={() => window.open("/panduan-cara-bayar", "_blank")}
//         />

//         {isUserActive && <HistorySection />}
//       </div>

//       {/* DESKTOP (≥ sm) */}
//       <div className="hidden sm:grid grid-cols-12 gap-6">
//         <div className="lg:col-span-5 col-span-12 space-y-5">
//           {activePacketData && <ActivePackageCard data={activePacketData} />}
//           <Image
//             src={bannerCS}
//             alt="banner CS"
//             className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
//             onClick={() => window.open(`https://wa.me/${phoneCS}`, "_blank")}
//           />
//         </div>

//         <div className="lg:col-span-7 col-span-12 flex flex-col gap-6">
//           <Image
//             src={bannerPanduan}
//             alt="Banner Panduan"
//             className="w-full drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
//             onClick={() => window.open("/panduan-cara-bayar", "_blank")}
//           />
//           {isUserActive && <HistorySection />}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ActivePacket;

import React from "react";

const ActivePacketTab = () => {
  return <div></div>;
};

export default ActivePacketTab;
