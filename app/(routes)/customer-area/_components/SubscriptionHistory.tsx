// "use client";

// import React, { useEffect, useState } from "react";
// import starIcon from "@/public/assets/Icons/icon-star.svg";
// import Image from "next/image";
// import redAlert from "@/public/assets/Icons/carbon_warning-filled.svg";
// import greenCheck from "@/public/assets/Icons/mdi_tick-circle.svg";
// import { getSubscriptionHistory } from "@/app/_api/Customer/CustomerArea";
// import toast from "react-hot-toast";
// import SubsHistoryCard from "./SubsHistoryCard";
// import { SubscriptionHistoryAPI } from "@/app/_shared/types/customer-area";

// const SubscriptionHistory = () => {
//   const [subscriptionHistory, setSubscriptionHistory] = useState<
//     SubscriptionHistoryAPI[]
//   >([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const fetchData = async () => {
//     setIsLoading(true);

//     try {
//       const resSubHistory = await getSubscriptionHistory({});

//       setSubscriptionHistory(resSubHistory.data);
//     } catch (err: any) {
//       toast.error(
//         err?.response?.data?.message || "Gagal muat data riwayat langganan"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//       {subscriptionHistory.map((history, index) => (
//         <SubsHistoryCard
//           key={index}
//           paid={history.paid || false}
//           mainTitle={history.mainTitle || "-"}
//           packageInfo={history.packageInfo || "-"}
//           subTitle={history.subTitle || "-"}
//           price={history.price || 0}
//         />
//       ))}
//     </div>
//   );
// };

// export default SubscriptionHistory;
