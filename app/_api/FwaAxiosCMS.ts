"use client";
import axios from "axios";
import { getCookie } from "cookies-next";

const baseURL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_INTERNAL_API_CMS_BASE_URL
    : process.env.NEXT_PUBLIC_API_CMS_BASE_URL || "/api";

const FwaAxiosCMS = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_CMS_BASE_URL, // local
  // baseURL: baseURL, // dev/staging/production
  headers: {
    "x-api-key": "FWA_EXT_TOKEN_2026",
    // "ngrok-skip-browser-warning": "6024",\
  },
});

FwaAxiosCMS.interceptors.request.use(async (req) => {
  // const token = await localStorage.getItem("access_token");
  const token = getCookie("token-ira");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

FwaAxiosCMS.interceptors.response.use(
  async (res) => {
    return res;
  },
  async (err) => {
    // error in global place here
    throw err;
  }
);

export default FwaAxiosCMS;
