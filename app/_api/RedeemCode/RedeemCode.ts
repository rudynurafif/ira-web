import FwaAxios from "../FwaAxios";

export const checkRedeemCode = async (payload: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/redeem-code/check",
      method: "POST",
      data: payload,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
