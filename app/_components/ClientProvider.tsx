"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { useClearOtpStorage } from "../hooks/useClearOtpStorage";
import { Notification } from "./Notification";

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  useClearOtpStorage();

  return (
    <Provider store={store}>
      {/* <Notification /> */}

      {children}
    </Provider>
  );
};

export default ClientProvider;
