import axios, { Axios } from "axios";
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

export const getUserLocation = async (addressPayload: any) => {
  try {
    // const data = await FwaAxios({
    //   url: "/customer-registration/user-location-geoapify",
    //   method: "POST",
    //   data: addressPayload,
    // });
    const data = await axios.post(
      "https://1d05d528b8b5.ngrok-free.app/customer-registration/user-location-geoapify",
      addressPayload
    );
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

    const dummyData = [
      {
        province_id: 16,
        province_name: "BANTEN",
        cities: [
          {
            city_id: 272,
            city_name: "KOTA SERANG",
            status: "live",
          },
          {
            city_id: 270,
            city_name: "KOTA TANGERANG",
            status: "live",
          },
          {
            city_id: 273,
            city_name: "KOTA TANGERANG SELATAN",
            status: "live",
          },
        ],
      },
      {
        province_id: 14,
        province_name: "DAERAH ISTIMEWA YOGYAKARTA",
        cities: [
          {
            city_id: 224,
            city_name: "KAB. BANTUL",
            status: "live",
          },
          {
            city_id: 223,
            city_name: "KAB. KULON PROGO",
            status: "live",
          },
        ],
      },
      {
        province_id: 11,
        province_name: "DKI JAKARTA",
        cities: [
          {
            city_id: 158,
            city_name: "KOTA ADM. JAKARTA BARAT",
            status: "live",
          },
          {
            city_id: 156,
            city_name: "KOTA ADM. JAKARTA PUSAT",
            status: "live",
          },
          {
            city_id: 159,
            city_name: "KOTA ADM. JAKARTA SELATAN",
            status: "live",
          },
        ],
      },
      {
        province_id: 12,
        province_name: "JAWA BARAT",
        cities: [
          {
            city_id: 164,
            city_name: "KAB. BANDUNG",
            status: "live",
          },
          {
            city_id: 177,
            city_name: "KAB. BANDUNG BARAT",
            status: "live",
          },
          {
            city_id: 176,
            city_name: "KAB. BEKASI",
            status: "live",
          },
          {
            city_id: 161,
            city_name: "KAB. BOGOR",
            status: "live",
          },
          {
            city_id: 163,
            city_name: "KAB. CIANJUR",
            status: "live",
          },
          {
            city_id: 169,
            city_name: "KAB. CIREBON",
            status: "live",
          },
          {
            city_id: 174,
            city_name: "KAB. PURWAKARTA",
            status: "live",
          },
          {
            city_id: 179,
            city_name: "KOTA BOGOR",
            status: "live",
          },
          {
            city_id: 182,
            city_name: "KOTA CIREBON",
            status: "live",
          },
          {
            city_id: 184,
            city_name: "KOTA DEPOK",
            status: "live",
          },
          {
            city_id: 186,
            city_name: "KOTA TASIKMALAYA",
            status: "live",
          },
        ],
      },
      {
        province_id: 13,
        province_name: "JAWA TENGAH",
        cities: [
          {
            city_id: 216,
            city_name: "KAB. BREBES",
            status: "live",
          },
          {
            city_id: 208,
            city_name: "KAB. DEMAK",
            status: "live",
          },
          {
            city_id: 213,
            city_name: "KAB. PEKALONGAN",
            status: "live",
          },
          {
            city_id: 214,
            city_name: "KAB. PEMALANG",
            status: "live",
          },
          {
            city_id: 221,
            city_name: "KOTA PEKALONGAN",
            status: "live",
          },
          {
            city_id: 220,
            city_name: "KOTA SEMARANG",
            status: "live",
          },
          {
            city_id: 222,
            city_name: "KOTA TEGAL",
            status: "live",
          },
        ],
      },
      {
        province_id: 15,
        province_name: "JAWA TIMUR",
        cities: [
          {
            city_id: 252,
            city_name: "KAB. GRESIK",
            status: "live",
          },
          {
            city_id: 259,
            city_name: "KOTA MALANG",
            status: "live",
          },
        ],
      },
    ];

    return dummyData;
  } catch (error) {
    throw error;
  }
};
