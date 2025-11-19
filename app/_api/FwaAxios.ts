"use client";
import axios from "axios";
import { getCookie } from "cookies-next";

const baseURL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_INTERNAL_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const FwaAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // kalo di local
  // baseURL: baseURL, // kalo mau naik ke dev/staging/production
  headers: {
    "x-api-key": "280999!FTTH",
    // "ngrok-skip-browser-warning": "6024",
  },
});

FwaAxios.interceptors.request.use(async (req) => {
  // const token = await localStorage.getItem("access_token");
  const token = getCookie("token-ira");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

FwaAxios.interceptors.response.use(
  async (res) => {
    return res;
  },
  async (err) => {
    // error in global place here
    throw err;
  }
);

export default FwaAxios;
