import FwaAxios from "../FwaAxios";

export const getPackageList = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/billing/package",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getProfileInfo = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/customer/detail",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateProfileInfo = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/customer/update",
      method: "PUT",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCustomerPackage = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/billing/customer-package",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
