import FwaAxios from "../FwaAxios";

export const PushFCMToken = async (payload: object) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/update-fcm",
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getAllNotif = async (param: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/notification",
      method: "GET",
      params: param,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const countAllNotif = async () => {
  try {
    const data = await FwaAxios({
      url: "/app/notification/count",
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const readAllNotif = async () => {
  try {
    const data = await FwaAxios({
      url: "/app/notification",
      method: "PUT",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const readNotifById = async (id: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/notification/" + id,
      method: "PUT",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const safeParseNotifPayload = (item: any) => {
  if (!item?.payload || !Array.isArray(item.payload)) {
    return item;
  }

  if (typeof item.payload?.[0] === "string") {
    try {
      item.payload[0] = JSON.parse(item.payload[0]);
    } catch {
      item.payload[0] = {
        notification: { title: "[Error]", body: "Invalid payload" },
        data: { title: "[Error]", body: "Invalid payload", type: "ERROR" },
        token: "",
      };
    }
  }

  return item;
};
