import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    responseCode: "2002700",
    responseMessage: "Success",
    status: true,
  });
}
