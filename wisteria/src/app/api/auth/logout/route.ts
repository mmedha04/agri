import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Create a response
  const response = NextResponse.json({ success: true });

  // Clear the authentication cookie by setting it to expire immediately
  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0), // Set to epoch time to expire immediately
    path: "/",
    sameSite: "lax",
  });
  response.cookies.set("userId", "", {
    httpOnly: true,
    expires: new Date(0), // Set to epoch time to expire immediately
    path: "/",
    sameSite: "lax",
  });

  return response;
}
