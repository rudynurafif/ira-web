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

export const sendOtpRegister = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/send-otp-register",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const sendOtpLogin = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/send-otp-login",
      method: "POST",
      data: body,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const sendOtpEmail = async (body: any) => {
  try {
    const data = await FwaAxios({
      url: "/app/auth/send-otp-email",
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
