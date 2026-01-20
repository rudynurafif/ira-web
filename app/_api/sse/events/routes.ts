export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const clientName = searchParams.get("clientName");
    const replace = searchParams.get("replace");

    if (!clientName) {
      return new Response("Missing clientName", { status: 400 });
    }

    const sseURL = `${
      process.env.INTERNAL_API_BASE_URL_SSE
    }/sse/events?clientName=${encodeURIComponent(
      clientName
    )}&replace=${replace}`;

    // console.log("[SSE PROXY] →", sseURL);

    const upstream = await fetch(sseURL, {
      headers: {
        "x-sse-token": process.env.INTERNAL_SSE_TOKEN!,
        Accept: "text/event-stream",
      },
    });

    if (!upstream.ok || !upstream.body) {
      console.error("[SSE PROXY] Upstream failed", upstream.status);
      return new Response("Upstream SSE error", { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[SSE PROXY] Fatal error", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
