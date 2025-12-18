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


  /* ================= AUTH ================= */
  const token = getCookie("token-ira");
  const token1 = "$2a$12$H/u0mKUtyv0AE4VixvBl2OvPfYYt7i3uiA9gI7GmfOq0y8inYirqi";

  const decodedToken = useMemo(() => {
    if (!token) return null;
    return decodeJwt(token as string) as DecodedToken;
  }, [token]);

  const BASE_URL_WEBHOOK = process.env.NEXT_PUBLIC_API_URL_WEBHOOK_ZHAFIR;

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await fetch(`${BASE_URL_WEBHOOK}/webhook`, {
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
