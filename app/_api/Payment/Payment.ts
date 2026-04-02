import FwaAxios from "../FwaAxios";

export const getPaymentChannel = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/va-bank",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequestVA = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/create-va",
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

export const createPaymentRequestEWallet = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/create-ewallet",
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

export const createPaymentRequestQRIS = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/create-qris",
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

export const createPaymentRequestOTC = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/create-otc",
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

export const getPaymentStatus = async () => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/status`,
      method: "GET",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentPayment = async () => {
  try {
    const data = await FwaAxios({
      url: `/app/transaction/current-payment`,
      method: "GET",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

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
