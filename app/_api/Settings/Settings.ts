import FwaAxios from "../FwaAxios";

export const getFAQs = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/faq/detail",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
