"use client";
import axios from "axios";
import { getCookie } from "cookies-next";

const baseURL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_INTERNAL_AREA_API_BASE_URL || process.env.NEXT_PUBLIC_AREA_API_BASE_URL
    : process.env.NEXT_PUBLIC_AREA_API_BASE_URL || "/api-area";

const FwaAxiosArea = axios.create({
  baseURL: baseURL,
  headers: {
    "x-api-key": "280999!FTTH",
  },
  timeout: 300000,
});

FwaAxiosArea.interceptors.request.use(async (req) => {
  const token = getCookie("token-ira");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

FwaAxiosArea.interceptors.response.use(
  async (res) => {
    return res;
  },
  async (err) => {
    throw err;
  },
);

export default FwaAxiosArea;
