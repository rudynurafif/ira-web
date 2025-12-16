"use client";

import { decodeJwt } from "@/app/_shared/utils";
import { getCookie } from "cookies-next";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";

type DecodedToken = {
  customer_id: string;
};

export default function TimeStream() {
  const [time, setTime] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const lastEventAtRef = useRef<number>(Date.now());
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= AUTH ================= */
  const token = getCookie("token-ira");
  const token1 = "$2a$12$H/u0mKUtyv0AE4VixvBl2OvPfYYt7i3uiA9gI7GmfOq0y8inYirqi";

  const decodedToken = useMemo(() => {
    if (!token) return null;
    return decodeJwt(token as string) as DecodedToken;
  }, [token]);

  /* ================= REFS ================= */
  const esRef = useRef<EventSourcePolyfill | null>(null);
  const mountedOnceRef = useRef(false); // 🔥 StrictMode guard
  const retryRef = useRef(0);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= SSE ================= */
  const connectSSE = (customerId: string) => {
    if (esRef.current) {
      console.log("🟡 SSE already connected");
      return;
    }

    const url = `https://g12qjjr8-4000.asse.devtunnels.ms/sse/events?clientName=${customerId}-web&replace=true`;

    console.log("🔌 Connecting SSE:", url);

    const es = new EventSourcePolyfill(url, {
      headers: {
        "x-sse-token": token1,
      },
      heartbeatTimeout: 60_000, // penting biar gak silent close
    });

    esRef.current = es;

    es.onopen = () => {
      console.log("✅ SSE CONNECTED");
      retryRef.current = 0;
      lastEventAtRef.current = Date.now();
      startHeartbeatWatch(customerId);
    };

    es.onmessage = (e) => {
      lastEventAtRef.current = Date.now();

      try {
        const payload = JSON.parse(e.data);
        setTime(payload.time);
      } catch (err) {
        console.warn("Invalid SSE payload", e.data);
      }
    };

    es.onerror = (err) => {
      console.warn("❌ SSE ERROR", err);
      cleanupSSE();
      scheduleReconnect(customerId);
    };
  };

  /* ================= RECONNECT ================= */
  const scheduleReconnect = (customerId: string) => {
    if (reconnectTimerRef.current) return;

    retryRef.current += 1;
    const delay = Math.min(1000 * 2 ** retryRef.current, 30000);

    console.log(`🔁 Reconnect SSE in ${delay}ms`);

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connectSSE(customerId);
    }, delay);
  };

  const startHeartbeatWatch = (customerId: string) => {
    stopHeartbeatWatch();

    heartbeatTimerRef.current = setInterval(() => {
      const diff = Date.now() - lastEventAtRef.current;

      if (diff > 90_000) {
        // 90 detik tanpa data
        console.warn("💔 SSE heartbeat lost");

        cleanupSSE();
        scheduleReconnect(customerId);
      }
    }, 30_000);
  };

  const stopHeartbeatWatch = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  /* ================= CLEANUP ================= */
  const cleanupSSE = () => {
    stopHeartbeatWatch();

    if (esRef.current) {
      console.log("🧹 Closing SSE");
      esRef.current.close();
      esRef.current = null;
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (!decodedToken?.customer_id) return;

    // 🔥 STRICT MODE GUARD (INI KUNCI UTAMA)
    if (mountedOnceRef.current) return;
    mountedOnceRef.current = true;

    connectSSE(decodedToken.customer_id);

    return () => {
      // ❗ Jangan close di dev StrictMode
      if (process.env.NODE_ENV === "production") {
        cleanupSSE();
      }
    };
  }, [decodedToken?.customer_id]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await fetch("https://g12qjjr8-4001.asse.devtunnels.ms/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-token": token1,
        },
        body: JSON.stringify({
          customer_code: decodedToken?.customer_id,
          message,
        }),
      });

      setChatHistory((prev) => [...prev, `You: ${message}`]);
      setMessage("");
    } catch (err) {
      console.error("Send failed", err);
    } finally {
      setIsSending(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6">
      <h2>Server time: {time}</h2>

      <div className="bg-gray-100 p-4 my-4">
        {chatHistory.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="border p-2 flex-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button disabled={isSending}>{isSending ? "..." : "Send"}</button>
      </form>
    </div>
  );
}
