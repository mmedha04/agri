import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import pool from "../../../../../lib/db";
import { signToken, verifyPassword } from "../../../../../lib/auth";

type UserRow = RowDataPacket & { UserId: number; PasswordField: string };

export async function POST(req: Request) {
  const { EmailId, PasswordField } = await req.json();

  // 1) fetch user
  const [rows] = await pool.query<UserRow[]>(
    "SELECT UserId, PasswordField FROM userData WHERE EmailId = ?",
    [EmailId]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 2) check password - now using async version
  const user = rows[0];
  const ok = await verifyPassword(PasswordField, user.PasswordField);

  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 3) sign & set cookie - now using async version
  const token = await signToken({ userId: user.UserId });

  const res = NextResponse.json({ success: true });
  res.cookies.set("token", token, {
    httpOnly: true,
    maxAge: 60 * 60, // 1h
    path: "/",
    sameSite: "lax", // Adding this for better security
  });

  res.cookies.set("userId", user.UserId.toString(), {
    httpOnly: true,
    maxAge: 60 * 60, // 1h
    path: "/",
    sameSite: "lax", // Adding this for better security
  });

  return res;
}
