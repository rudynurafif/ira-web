import FwaAxios from "../FwaAxios";

export const GetListGeocode = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/coverage/maps/geocode",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
