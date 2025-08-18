import FtthAxios from "./FwaAxios";

export const getActivePacket = async (params: any) => {
  try {
    // const data = await FtthAxios({
    //   url: "/customer/active-packet",
    //   method: "GET",
    //   params: params,
    // });

    const dummyData = {
      isPaid: false,
      packageInfo: "Paket Starlite Ngebut Up To 500 Mbps",
      packagePrice: "Rp 250.000/Bulan",
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
      fullName: "Sugeng Prasetyo",
      phoneNumber: "08212348889012",
      email: "sugengpresetio@mail.com",
      address:
        "BINONG KAMPUNG CIJENGIR GANG GURU LILI NO 178 CURUG 00403 KAB TANGERANG 15810",
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
        packageInfo: "Paket 200Mbps Starlite",
        subTitle: "Bayarkan tagihan Anda tanggal 10 Juli 2025",
        price: "Rp100.000/Bulan",
      },
      {
        paid: true,
        mainTitle: "Tagihan Lunas",
        packageInfo: "Unlimited Package",
        subTitle: "Aktif sampai 10 Juni 2025",
        price: "Rp0/Bulan",
      },
    ];

    return dummyData;
  } catch (error) {
    throw error;
  }
};


