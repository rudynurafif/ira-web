import FwaAxios from "../FwaAxios";

export const getShipment = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/customer/shipment",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
