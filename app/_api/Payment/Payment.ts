import FwaAxios from "../FwaAxios";

export const getPaymentChannel = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/available-channels",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentRequest = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/transaction/payment-request",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
