import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "../lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  console.log("Token:", token);

  if (!token) {
    console.log("No token found");
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  const verified = await verifyToken(token);
  if (!verified) {
    console.log("Token verification failed");
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/home/:path*"],
};
