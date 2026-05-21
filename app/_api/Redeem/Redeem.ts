import FwaAxios from "../FwaAxios";

export const getActiveCampaign = async () => {
  try {
    const data = await FwaAxios({
      url: "/app/redeem-code/check-active-campaign",
      method: "GET",
    });

    return data;
  } catch (error) {
    throw error;
  }
};
