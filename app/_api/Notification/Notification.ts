import FwaAxios from "../FwaAxios";

export const StoreFCMToken = async (payload: object) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/store-fcm-token",
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateFCMToken = async (payload: object) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/update-fcm-token",
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteFCMToken = async (payload: object) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/logout",
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

export const countAllNotif = async (category?: string) => {
  try {
    const params: any = {};

    if (category === "notification") {
      params.category = "notification";
    } else if (category === "information") {
      params.category = "information";
    }
    // category undefined/empty = semua

    const data = await FwaAxios({
      url: "/app/notification/count",
      method: "GET",
      params,
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

  let parsedPayload = item.payload[0];

  // Parse jika string
  if (typeof parsedPayload === "string") {
    try {
      parsedPayload = JSON.parse(parsedPayload);
    } catch {
      parsedPayload = {
        notification: { title: "[Error]", body: "Invalid payload" },
        data: { title: "[Error]", body: "Invalid payload", type: "ERROR" },
        token: "",
      };
    }
  }

  // Tangani kedua format struktur
  let finalNotification, finalData;

  // Format 1: nested dalam data.destination.firebase
  if (parsedPayload?.destination === "firebase" && parsedPayload?.data) {
    finalNotification = parsedPayload.data.notification || {};
    finalData = parsedPayload.data.data || {};
  }
  // Format 2: langsung di root
  else {
    finalNotification = parsedPayload?.notification || {};
    finalData = parsedPayload?.data || {};
  }

  // Return struktur yang konsisten
  return {
    ...item,
    payload: [
      {
        notification: finalNotification,
        data: finalData,
        token: parsedPayload?.token || "",
      },
    ],
  };
};
