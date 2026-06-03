// BASE URL REZA (OLD)

"use client";
import axios from "axios";
import { getCookie } from "cookies-next";

const baseURL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_INTERNAL_MAP_SEARCH_API_BASE_URL ||
      process.env.NEXT_PUBLIC_MAP_SEARCH_API_BASE_URL
    : process.env.NEXT_PUBLIC_MAP_SEARCH_API_BASE_URL || "/api-mapsearch";

const FwaAxiosMapSearch = axios.create({
  baseURL: baseURL,
  headers: {
    "x-api-key": "280999!FTTH",
  },
  timeout: 300000,
});

FwaAxiosMapSearch.interceptors.request.use(async (req) => {
  const token = getCookie("token-ira");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

FwaAxiosMapSearch.interceptors.response.use(
  async (res) => {
    return res;
  },
  async (err) => {
    throw err;
  },
);

export default FwaAxiosMapSearch;
