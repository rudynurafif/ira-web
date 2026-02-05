import FwaAxios from "../FwaAxios";

export const PushFCMToken = async (payload: object) => {
  try {
    const data = await FwaAxios({
      url: "/sales-kit/auth/update-fcm",
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const countNotif = async () => {
  try {
    const data = await FwaAxios({
      url: "/sales-kit/notification/count",
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const listNotification = async (param: any) => {
  try {
    const data = await FwaAxios({
      url: "/sales-kit/notification",
      method: "GET",
      params: param,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const readNotifById = async (id: any) => {
  try {
    const data = await FwaAxios({
      url: "/sales-kit/notification/" + id,
      method: "PUT",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const readAllNotif = async () => {
  try {
    const data = await FwaAxios({
      url: "/sales-kit/notification",
      method: "PUT",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
