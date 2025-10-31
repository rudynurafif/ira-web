import FwaAxios from "../FwaAxios";

export const getActivePacket = async (params: any) => {
  try {
    // const data = await FwaAxios({
    //   url: "/customer/active-packet",
    //   method: "GET",
    //   params: params,
    // });

    const dummyData = {
      packageName: "Starlite 30 Hari [UNLIMITED]",
      packageDuration: "30 Hari",
      price: "Rp100.000",
      speed: "200Mbps",
      expiryDate: "18 Oktober 2025",
    };

    return dummyData;
  } catch (error) {
    throw error;
  }
};

export const getProfileInfo = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/customer/detail",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateProfileInfo = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/customer/update",
      method: "PUT",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionHistory = async (params: any) => {
  try {
    // const data = await FwaAxios({
    //   url: "/customer/subscription-history",
    //   method: "GET",
    //   params: params,
    // });

    const dummyData = [
      {
        paid: false,
        mainTitle: "Pembayaran sudah jatuh tempo",
        packageInfo: "Paket Starlite FWA 30 Hari",
        subTitle: "Bayarkan tagihan Anda tanggal 10 Agustus 2025",
        price: "Rp100.000/Bulan",
      },
      {
        paid: true,
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
