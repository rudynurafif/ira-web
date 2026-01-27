import FwaAxios from "../FwaAxios";
import FwaAxiosCMS from "../FwaAxiosCMS";

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

export const getDataTNC = async () => {
  try {
    const data = await FwaAxios({
      url: "/app/tnc",
      method: "GET",
      // params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getPrivacyPolicy = async () => {
  try {
    const data = await FwaAxios({
      url: "/app/privacy-policy",
      method: "GET",
      // params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getRefundPolicy = async () => {
  try {
    const data = await FwaAxios({
      url: "/app/refund-policy",
      method: "GET",
      // params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getSetting = async (param: any) => {
  try {
    const data = await FwaAxios({
      url: `/app/setting/${param}`,
      method: "GET",
      // params: param,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
