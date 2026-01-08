import { ProfileInfo } from "@/app/_shared/types/customer-area";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CookieValueTypes, deleteCookie, getCookie } from "cookies-next";

interface AuthState {
  isLoggedIn: boolean;
  token: string | Promise<CookieValueTypes> | null;
  userInfo: ProfileInfo | null;
  shipmentStatus: string | null;
  is_coverage: boolean | null;
}

const tokenFromCookie = getCookie("token-ira");

const initialState: AuthState = {
  isLoggedIn: tokenFromCookie ? true : false,
  token: getCookie("token-ira") || null,
  userInfo: null,
  shipmentStatus: null,
  is_coverage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{
        token: string;
      }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
    },
    getUser(state, action: PayloadAction<ProfileInfo>) {
      state.userInfo = action.payload;
    },
    setShipmentStatus(state, action: PayloadAction<string | null>) {
      state.shipmentStatus = action.payload;
    },
    setCoverageStatus(state, action: PayloadAction<boolean>) {
      state.is_coverage = action.payload;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.userInfo = null;
      deleteCookie("token-ira");
    },
  },
});

export const { login, getUser, setShipmentStatus, setCoverageStatus, logout } = authSlice.actions;
export default authSlice.reducer;
