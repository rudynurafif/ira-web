"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCookie } from "cookies-next";
import { decodeJwt } from "@/app/_shared/utils";

type DecodedToken = {
  phone_number: string;
  id: string;
  customer_id: string;
  name: string;
  iat: number;
  exp: number;
};

type SSEContextType = {
  serverTime: string | null;
  chatMessages: string[];
  sendMessage: (msg: string) => Promise<void>;
};

const SSEContext = createContext<SSEContextType | null>(null);
const BASE_URL_SSE = process.env.NEXT_PUBLIC_API_URL_SSE_ZHAFIR;

export const useSSE = () => {
  const context = useContext(SSEContext);
  if (!context) throw new Error("useSSE must be used within SSEProvider");
  return context;
};

export function SSEProvider({ children }: { children: React.ReactNode }) {
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([]);

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

    const connect = () => {
      es = new EventSource(
        `${BASE_URL_SSE}/sse/events?clientName=${encodeURIComponent(
          decodedToken.customer_id
        )}-web&replace=true`
      );

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.time) setServerTime(data.time);
        if (data.message) {
          setChatMessages((prev) => [...prev, `Bot: ${data.message}`]);
        }
      };

      es.onerror = () => {
        es?.close();
        retryTimeout = setTimeout(connect, 1000);
      };
    };

    connect();

    return () => {
      es?.close();
      clearTimeout(retryTimeout);
    };
  }, [decodedToken?.customer_id]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      await fetch(`${BASE_URL_SSE}/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
        },
        body: JSON.stringify({
          type: "activate",
          sn: "G20250200620",
          result: 0,
          message: "Success",
          data: {
            cellID: 131,
            PCI: 1,
          },
        }),
      });

      setChatMessages((prev) => [...prev, `You: ${message}`]);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <SSEContext.Provider value={{ serverTime, chatMessages, sendMessage }}>
      {children}
    </SSEContext.Provider>
  );
}
