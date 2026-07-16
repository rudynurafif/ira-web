import { useEffect, useRef } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";
import { SSEPayload } from "@/app/_shared/types/CoreNetwork";

export type SSECallback = (payload: SSEPayload) => void;

type Subscriber = {
  onEvent: SSECallback;
  filter: (payload: SSEPayload) => boolean;
  onOpen?: () => void;
  onError?: () => void;
};

// Server memakai `replace=true` per clientName, sehingga dua koneksi dengan
// customer_id yang sama akan saling menendang. Karena itu semua hook aktif
// berbagi SATU koneksi di level module, bukan satu koneksi per hook.
let sharedEs: EventSourcePolyfill | null = null;
let sharedCustomerId: string | null = null;
const subscribers = new Set<Subscriber>();

function closeSharedConnection(reason: string) {
  if (!sharedEs) return;
  console.log(`⚪ [SSE] Closed (${reason})`);
  sharedEs.close();
  sharedEs = null;
  sharedCustomerId = null;
}

function ensureSharedConnection(customer_id: string) {
  if (sharedEs && sharedCustomerId === customer_id) return;

  closeSharedConnection("customer changed");
  sharedCustomerId = customer_id;

  console.log("🟢 [SSE] Opening shared connection...");
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
  sharedEs = es;

  es.onopen = () => {
    console.log("✅ [SSE] Successfully connected");
    subscribers.forEach((sub) => sub.onOpen?.());
  };

  es.onmessage = (event: any) => {
    let payload: SSEPayload;
    try {
      payload = JSON.parse(event.data);
    } catch (e) {
      console.error("[SSE] Parse error", e);
      return;
    }

    // one-time: subscriber yang cocok dilepas setelah menerima event-nya
    for (const sub of Array.from(subscribers)) {
      if (!sub.filter(payload)) continue;
      subscribers.delete(sub);
      sub.onEvent(payload);
    }

    if (subscribers.size === 0) {
      closeSharedConnection("all listeners done");
    }
  };

  es.onerror = () => {
    console.warn("🔴 [SSE] Connection error");
    const failed = Array.from(subscribers);
    subscribers.clear();
    closeSharedConnection("error");
    failed.forEach((sub) => sub.onError?.());
  };
}

export function useSSEOneTime(
  customer_id: string,
  onEvent: SSECallback,
  shouldListen: boolean = true,
  filter?: (payload: SSEPayload) => boolean,
  onOpen?: () => void,
  onError?: () => void
) {
  // Callback disimpan di ref agar subscriber selalu memanggil versi terbaru
  // tanpa harus membuka ulang koneksi setiap render.
  const onEventRef = useRef(onEvent);
  const filterRef = useRef(filter);
  const onOpenRef = useRef(onOpen);
  const onErrorRef = useRef(onError);
  onEventRef.current = onEvent;
  filterRef.current = filter;
  onOpenRef.current = onOpen;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!shouldListen || !customer_id) return;

    const sub: Subscriber = {
      onEvent: (payload) => onEventRef.current(payload),
      filter: (payload) => filterRef.current?.(payload) ?? true,
      onOpen: () => onOpenRef.current?.(),
      onError: () => onErrorRef.current?.(),
    };

    subscribers.add(sub);
    ensureSharedConnection(customer_id);

    // Koneksi sudah terbuka sebelum subscriber ini bergabung
    if (sharedEs && sharedEs.readyState === EventSourcePolyfill.OPEN) {
      sub.onOpen?.();
    }

    return () => {
      subscribers.delete(sub);
      if (subscribers.size === 0) {
        closeSharedConnection("cleanup");
      }
    };
  }, [customer_id, shouldListen]);
}
