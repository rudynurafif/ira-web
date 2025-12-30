import { useEffect, useRef, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { SSEPayload } from "@/app/_shared/types/CoreNetwork";

export type SSECallback = (payload: SSEPayload) => void;

export function useSSEOneTime(
  customer_id: string,
  onEvent: SSECallback,
  shouldListen: boolean = true,
  filter?: (payload: SSEPayload) => boolean,
  onOpen?: () => void
) {
  const esRef = useRef<EventSourcePolyfill | null>(null);

  useEffect(() => {
    if (!shouldListen || !customer_id) return;

    console.log("🟢 [SSE] Opening one-time connection...");

    const es = new EventSourcePolyfill(
      `${
        process.env.NEXT_PUBLIC_API_URL_SSE
      }/sse/events?clientName=${encodeURIComponent(
        customer_id
      )}-web&replace=true`,
      {
        headers: {
          "x-sse-token": "LOCALWEAVE",
        },
        heartbeatTimeout: 600_000, // 10 menit
      }
    );

    es.onopen = () => {
      console.log("✅ [SSE] Successfully connected");
      onOpen?.();
    };

    const handleMessage = (event: any) => {
      try {
        const payload: SSEPayload = JSON.parse(event.data);
        console.log("📥 [SSE] Received:", payload);
        if (filter && !filter(payload)) return;

        onEvent(payload);
        es.close();
        console.log("⚪ [SSE] Closed after receiving event");
      } catch (e) {
        console.error("[SSE] Parse error", e);
      }
    };

    es.onmessage = handleMessage;
    es.onerror = () => {
      console.warn("🔴 [SSE] Connection error");
      es.close();
    };

    // Tutup saat unmount
    return () => {
      console.log("⚪ [SSE] Cleanup");
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [customer_id, filter, onEvent, onOpen, shouldListen]);
}
