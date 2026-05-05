import FwaAxios from "../FwaAxios";
import FwaAxiosArea from "../FwaAxiosArea";
import FwaAxiosMapSearch from "../FwaAxiosMapSearch";
import { getSetting } from "../Settings/Settings";
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

export const getCheckCoverageLogin = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "app/coverage/account-check-coverage",
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

export const getLocationByPostalCode = async (postalCode: string) => {
  try {
    const data = await FwaAxios({
      url: "/app/location/location-by-postal-code",
      method: "GET",
      params: { postal_code: postalCode },
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

// ==========================================================================
// MAP
// ==========================================================================

/**
 * Get dropdown location suggest
 * @param params {q: string}
 * @returns id, name, full_address
 */
export const getMapboxSuggest = async (params: any) => {
  try {
    const data = await FwaAxiosMapSearch({
      url: "/api/mapbox/suggest",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get mapbox retrieve
 * @param id string
 * @returns lat, lng, postcode
 */
export const getMapboxRetrieve = async (id: string) => {
  try {
    const data = await FwaAxiosMapSearch({
      url: `/api/mapbox/retrieve/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get location reverse
 * @param params {lat: number | string, lng: number | string}
 * @returns postcode
 */
export const getLocationReverse = async (params: {
  lat: number | string;
  lng: number | string;
}) => {
  try {
    const data = await FwaAxiosMapSearch({
      url: `/api/location/reverse`,
      method: "GET",
      params: {
        latitude: params.lat,
        longitude: params.lng,
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get boundary area
 * @param params {province_id, city_id, district_id, sub_district_id, postal_code, is_map_moving, latitude, longitude}
 * @returns bbox area boundary
 */
export const getBoundaryArea = async (params: {
  province_id: string;
  city_id: string;
  district_id: string;
  sub_district_id: string;
  postal_code: string;
  is_map_moving?: boolean;
  latitude?: number | string;
  longitude?: number | string;
}) => {
  try {
    const data = await FwaAxiosArea({
      url: "/app/location/boundary",
      method: "GET",
      params: params,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
