"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface IContext {
  isAvail: string;
  setIsAvail: Dispatch<SetStateAction<string>>;
  locationMap: any;
  setLocationMap: Dispatch<SetStateAction<any>>;
  coverageLocation: any;
  setCoverageLocation: Dispatch<SetStateAction<any>>;

  dateStart: string;
  setDateStart: Dispatch<SetStateAction<string>>;
  dateEnd: string;
  setDateEnd: Dispatch<SetStateAction<string>>;

  countNotification: any;
  setCountNotification: any;

  isModalAbsen: any;
  setIsModalAbsen: any;
  // Masukkan semua properti yang diperlukan di sini bentuknya seperti di bawah
  //   showModalSidebar: boolean;
  //   setShowModalSidebar: Dispatch<SetStateAction<boolean>>;
}

const AppContext = createContext<IContext | null>(null);

export const useAppContext = () => {
  const appContext = useContext(AppContext);

  if (!appContext) {
    throw new Error(
      "useAppContext has to be used within <AppContext.Provider>",
    );
  }

  return appContext;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Masukkan state yang diperlukan di sini bentuknya seperti di bawah

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressSave, setAddressSave] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [coverageLocation, setCoverageLocation] = useState(null);
  const [locationMap, setLocationMap] = useState(null);
  const [isAvail, setIsAvail] = useState("");
  const [countNotification, setCountNotification] = useState(0);

  const [isModalAbsen, setIsModalAbsen] = useState(false);
  return (
    <AppContext.Provider
      value={{
        coverageLocation,
        setCoverageLocation,
        locationMap,
        setLocationMap,
        isAvail,
        setIsAvail,
        dateStart,
        setDateStart,
        dateEnd,
        setDateEnd,
        isModalAbsen,
        setIsModalAbsen,
        countNotification,
        setCountNotification,
        // Masukkan properti yang diperlukan di sini bentuknya seperti di bawah
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
