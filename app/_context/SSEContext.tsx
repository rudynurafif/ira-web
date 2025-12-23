"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCookie } from "cookies-next";
import { decodeJwt } from "@/app/_shared/utils";
import { EventSourcePolyfill } from "event-source-polyfill";
import { SSEPayload } from "../_shared/types/CoreNetwork";

type DecodedToken = {
  phone_number: string;
  id: string;
  customer_id: string;
  name: string;
  iat: number;
  exp: number;
};

interface WifiConfig {
  ssid?: string;
  password?: string;
  ssid5?: string;
  password5?: string;
}

type SSEContextType = {
  serverTime: string | null;
  chatMessages: string[];
  lastEvent: SSEPayload | null;
  wifiConfig: WifiConfig;
};

const SSEContext = createContext<SSEContextType | null>(null);
const BASE_URL_SSE = process.env.NEXT_PUBLIC_API_URL_SSE;

export const useSSE = () => {
  const context = useContext(SSEContext);
  if (!context) throw new Error("useSSE must be used within SSEProvider");
  return context;
};

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [lastEvent, setLastEvent] = useState<SSEPayload | null>(null);
  const [wifiConfig, setWifiConfig] = useState<WifiConfig>({});

  const token = getCookie("token-ira");
  const decodedToken = useMemo(() => {
    if (!token) return null;
    return decodeJwt(token as string) as DecodedToken | null;
  }, [token]);

  // Subscribe SSE on mount
  useEffect(() => {
    if (!decodedToken?.customer_id) return;

    let es: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout;
    let isFirstConnect = true;

    const connect = () => {
      es = new EventSourcePolyfill(
        `${BASE_URL_SSE}/sse/events?clientName=${encodeURIComponent(
          decodedToken.customer_id
        )}-web&replace=true`,
        {
          headers: {
            "x-sse-token": "LOCALWEAVE",
          },
          heartbeatTimeout: 1_800_000, // 30 menit
        }
      );

      es.onopen = () => {
        if (isFirstConnect) {
          console.log("🟢 [SSE] Connected");
          isFirstConnect = false;
        } else {
          console.log("🔄 [SSE] Reconnected");
        }
      };

      es.onmessage = (event) => {
        const payload: SSEPayload = JSON.parse(event.data);
        setLastEvent(payload);
        console.log(payload);

        // const data = JSON.parse(event.data);
        // console.log(data);
      };

      es.onerror = () => {
        console.log("🔴 [SSE] Disconnected, retrying in 3s...");
        es?.close();
        retryTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      console.log("⚪ [SSE] Connection closed (cleanup)");
      es?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [decodedToken?.customer_id]);

  return (
    <SSEContext.Provider
      value={{ serverTime, chatMessages, lastEvent, wifiConfig }}
    >
      {children}
    </SSEContext.Provider>
  );
}
