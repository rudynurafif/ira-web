import axios from "axios";
import FwaAxios from "../FwaAxios";

export const loginUser = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/login",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/register",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const sendOtp = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/send-otp",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/verify-otp",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
