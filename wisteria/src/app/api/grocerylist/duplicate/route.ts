import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../../lib/db"; // adjust the path to your db connection file

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { glId } = body; // original list id

    if (!glId) {
      return NextResponse.json({ error: "Missing glId" }, { status: 400 });
    }

    const userIdCookie = req.cookies.get("userId")?.value;
    if (!userIdCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = Number(userIdCookie);

    // Call the stored procedure
    await pool.query(`CALL CopyGroceryList(?, ?)`, [glId, userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
