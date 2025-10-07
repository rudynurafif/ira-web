import FwaAxios from "../FwaAxios";

// untuk perubahan / pergeseran map
export const GetListGeocode = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/location/geocode",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
