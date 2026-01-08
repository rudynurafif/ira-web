import { SetSSIDBody } from "@/app/_shared/types/CoreNetwork";
import FwaAxios from "../FwaAxios";

export const getSignal = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/core-network/get-signal",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const Callback = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/webhook/acs",
      method: "POST",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getDetailCPE = async () => {
  try {
    const data = await FwaAxios({
      url: "/app/cpe/detail",
      method: "GET",
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const getSSID = async (params: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/core-network/get-ssid",
      method: "GET",
      params: params,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const setSSID = async (body: SetSSIDBody) => {
  try {
    const data = await FwaAxios({
      url: "/app/core-network/set-ssid",
      method: "POST",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const refreshTask = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/core-network/refresh-task",
      method: "POST",
      data: body,
    });

    return data;
  } catch (error) {
    throw error;
  }
};
