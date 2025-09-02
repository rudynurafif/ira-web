"use client";
import axios from "axios";
import { getCookie } from "cookies-next";

const FwaAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    // "x-api-key": "280999!FTTH",
    // "ngrok-skip-browser-warning": "6024",
  },
});

FwaAxios.interceptors.request.use(async (req) => {
  // const token = await localStorage.getItem("access_token");
  const token = getCookie("token");
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
