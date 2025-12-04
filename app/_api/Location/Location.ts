import axios, { Axios } from "axios";
import FwaAxios from "../FwaAxios";
import { dummyCoveredLocations } from "@/app/_shared/data/location";

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

export const getUserLocation = async (addressPayload: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/location/user-location-geoapify",
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

export const getListLocation = async (params: any) => {
  try {
    // const data = await FwaAxios({
    //   url: "/app/coverage-area",
    //   method: "GET",
    //   params: params,
    // });

    return dummyCoveredLocations;
  } catch (error) {
    throw error;
  }
};
