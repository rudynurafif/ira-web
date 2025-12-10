import { NextRequest } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Kirim pesan awal agar client tahu koneksi berhasil
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ message: "connected" })}\n\n`)
      );

      const interval = setInterval(() => {
        const payload = { time: new Date().toISOString() };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
      }, 1000);

      // jika client tutup koneksi, bersihkan interval & tutup stream
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none", // optional: disable compression
    },
  });
}
