import FwaAxios from "../FwaAxios";

export const getSignal = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/core-network/get-signal",
      method: "GET",
      params: params, // ?sn=xxx
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const Callback = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/webhook/acs",
      method: "POST",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
