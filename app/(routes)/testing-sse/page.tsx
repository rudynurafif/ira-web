"use client";

import { decodeJwt } from "@/app/_shared/utils";
import { getCookie } from "cookies-next";
import { useEffect, useMemo, useState } from "react";

type DecodedToken = {
  phone_number: string;
  id: string;
  customer_id: string;
  name: string;
  iat: number;
  exp: number;
};

export default function TimeStream() {
  const [time, setTime] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(""); 
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);

  const token = getCookie("token-ira");
  const decodedToken = useMemo(() => {
    if (!token) return null;
    return decodeJwt(token as string) as DecodedToken | null;
  }, [token]);

  // Fungsi untuk mengirim POST request
  const sendMessage = async () => {
    if (!message.trim()) return; // Jangan kirim pesan kosong
    setIsSending(true);

    try {
      await fetch("https://g12qjjr8-4001.asse.devtunnels.ms/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Connection: "keep-alive",
        },
        body: JSON.stringify({ sourceClient: decodedToken?.customer_id, message }),
      });

      // Tambahkan pesan ke chat history
      setChatHistory([...chatHistory, `You: ${message}`]);

      // Reset input
      setMessage("");
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!decodedToken?.customer_id) return;

    const eventSource = new EventSource(
      `https://g12qjjr8-4000.asse.devtunnels.ms/sse/events?clientName=${encodeURIComponent(
        decodedToken.customer_id
      )}&replace=true`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTime(data.time);
      } catch (e) {
        console.error("Failed to parse SSE message", e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    // return () => {
    //   eventSource.close();
    // };
  }, [decodedToken?.customer_id]);

  return (
    <div className="mx-auto container p-6">
      <h2>Current server time: {time}</h2>

      <div
        className="chat-box bg-gray-100 p-4 rounded-lg my-4"
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        {/* Menampilkan history chat */}
        {chatHistory.map((msg, index) => (
          <div key={index} className="chat-message p-2">
            {msg}
          </div>
        ))}
      </div>

      <div className="chat-input flex items-center space-x-4">
        {/* Input Chat Box */}
        <input
          type="text"
          className="border p-2 flex-1 rounded"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Tombol Kirim */}
        <button
          disabled={isSending}
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
