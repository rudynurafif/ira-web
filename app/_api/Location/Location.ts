import FwaAxios from "../FwaAxios";

export const getProvince = async (params: any = "") => {
  try {
    const data = await FwaAxios({
      url: "/app/location/province",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCity = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/location/city",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getDistrict = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/location/district",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSubDistrict = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/location/sub-district",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getPostalCode = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/location/postal-code",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// _api/Location/Location.ts
export const getUserLocation = async (addressPayload: { address: any[] }) => {
  try {
    const data = await FwaAxios({
      url: "/app/location/user-location",
      method: "POST",
      data: addressPayload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCheckCoverage = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "app/coverage/check",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
