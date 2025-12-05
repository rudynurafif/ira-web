import FwaAxios from "../_api/FwaAxios";

export const getImageBanner = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/banner",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
