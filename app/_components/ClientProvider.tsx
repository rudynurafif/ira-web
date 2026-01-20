"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { useClearOtpStorage } from "../hooks/useClearOtpStorage";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  useClearOtpStorage();

  return <Provider store={store}>{children}</Provider>;
};

export default ClientProvider;
