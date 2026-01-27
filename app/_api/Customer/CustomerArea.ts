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

export const checkPackage = async () => {
  try {
    const data = await FwaAxios({
      url: `/app/billing/check-package`,
      method: "GET",
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

export const downloadInvoice = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/billing/pdf",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getDealerSuppPhone = async () => {
  try {
    const data = await FwaAxios({
      url: "/app/customer/get-mitra-phone",
      method: "GET",
      // params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
