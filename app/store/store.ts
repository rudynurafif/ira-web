import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import authReducer from "./slice/authSlice";
import customerPackageReducer from "@/app/store/slice/customerPackageSlice";
import campaignReducer from "./slice/campaignSlice";
import { apiSlice } from "./slice/apiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customerPackage: customerPackageReducer,
    campaign: campaignReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

// Tipe RootState dan AppDispatch untuk digunakan di seluruh aplikasi
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hook khusus untuk menggunakan dispatch dan selector dengan tipe yang benar
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
