import FtthAxios from "./FwaAxios";
import starIcon from "@/public/assets/Icons/icon-star.svg";

export const getActivePacket = async (params: any) => {
  try {
    // const data = await FtthAxios({
    //   url: "/customer/active-packet",
    //   method: "GET",
    //   params: params,
    // });

    const dummyData = {
      isPaid: true,
      isActive: false,
      packageInfo: "Paket Free Trial Starlite FWA 30 Hari",
      packagePrice: "100.000/Bulan",
      dueDate: "30 Januari 2025",
    };

    return dummyData;
  } catch (error) {
    throw error;
  }
};

export const getProfileInfo = async (params: any) => {
  try {
    // const data = await FtthAxios({
    //   url: "/customer/profile",
    //   method: "GET",
    //   params: params,
    // });

    const dummyData = {
      id: "STL10089766890",
      fullName: "Sugeng Prasetyo Namanya Panjang Banget",
      phoneNumber: "08212348889012",
      email: "sugengpresetio@mail.com",
      address:
        "BINONG KAMPUNG CIJENGIR GANG GURU LILI NO 178 CURUG 00403 KAB TANGERANG 15810",
      avatar: starIcon,
    };

    return dummyData;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionHistory = async (params: any) => {
  try {
    // const data = await FtthAxios({
    //   url: "/customer/subscription-history",
    //   method: "GET",
    //   params: params,
    // });

    const dummyData = [
      {
        paid: false,
        mainTitle: "Pembayaran sudah jatuh tempo",
        packageInfo: "Paket Starlite FWA 30 Hari",
        subTitle: "Bayarkan tagihan Anda tanggal 10 Juli 2025",
        price: "Rp100.000/Bulan",
      },
      {
        paid: true,
        mainTitle: "Tagihan Lunas",
        packageInfo: "Paket Starlite FWA 30 Hari",
        subTitle: "Aktif sampai 10 Juni 2025",
        price: "Rp0/Bulan",
      },
    ];

    return dummyData;
  } catch (error) {
    throw error;
  }
};
