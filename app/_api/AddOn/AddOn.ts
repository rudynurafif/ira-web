import FwaAxios from "../FwaAxios";

export const getAddOn = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/add-on",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
