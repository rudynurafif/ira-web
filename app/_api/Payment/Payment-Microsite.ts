import FwaAxios from "../FwaAxios";

export const getPaymentMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/payment-microsite",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const checkPackageMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/check-status-customer-microsite`,
      method: "POST",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getPackageListMicrosite = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/billing/package-microsite",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentChannelMicrosite = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/va-bank-microsite",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequestVAMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/create-va-microsite",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequestVAMidtransMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/midtrans/va-bank-microsite",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getVaById = async (id: string) => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/get-va/${id}`,
      method: "GET",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequestEWalletMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/create-ewallet-microsite",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequestGopayMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/midtrans/gopay-microsite",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequestShopeePayMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/airpay/shopeepay-microsite",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getEWalletById = async (id: string) => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/get-ewallet/${id}`,
      method: "GET",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequestQRISMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/create-qris-microsite",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getQRISById = async (id: string) => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/get-qris/${id}`,
      method: "GET",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequestOTCMicrosite = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/create-otc-microsite",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getOTCById = async (id: string) => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/get-otc/${id}`,
      method: "GET",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentStatusMicrosite = async (params?: any) => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/status-microsite`,
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentPaymentMicrosite = async (params?: any) => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/current-payment-microsite`,
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
