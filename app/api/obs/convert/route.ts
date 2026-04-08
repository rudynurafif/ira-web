import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    const response = await axios({
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_URL_OBS}/app/obs/convert`,
      headers: {
        "X-AUTH-TOKEN": "abid123!",
      },
      data: {
        url: url,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("OBS Proxy Error:", error?.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to convert OBS URL" },
      { status: error?.response?.status || 500 },
    );
  }
}
