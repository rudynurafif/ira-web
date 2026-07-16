"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCookie } from "cookies-next";
import { decodeJwt } from "@/app/_shared/utils";
import { EventSourcePolyfill } from "event-source-polyfill";
import { SSEPayload } from "../_shared/types/CoreNetwork";
import { DecodedToken, SSEContextType, WifiConfig } from "./sse.type";

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
    let retryCount = 0;
    let isCleanedUp = false;

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
        retryCount = 0;
        if (isFirstConnect) {
          console.log("🟢 [SSE] Connected");
          isFirstConnect = false;
        } else {
          console.log("🔄 [SSE] Reconnected");
        }
      };

      es.onmessage = (event) => {
        try {
          const payload: SSEPayload = JSON.parse(event.data);
          setLastEvent(payload);
          console.log(payload);
        } catch (e) {
          console.error("[SSE] Parse error", e);
        }
      };

      es.onerror = () => {
        es?.close();
        if (isCleanedUp) return;

        // Exponential backoff: 3s, 6s, 12s, ... maksimal 60s
        const delay = Math.min(3_000 * 2 ** retryCount, 60_000);
        retryCount += 1;
        console.log(`🔴 [SSE] Disconnected, retrying in ${delay / 1000}s...`);
        retryTimeout = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      console.log("⚪ [SSE] Connection closed (cleanup)");
      isCleanedUp = true;
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
