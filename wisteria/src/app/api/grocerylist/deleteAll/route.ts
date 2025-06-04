import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../../lib/db";

export async function DELETE(req: NextRequest) {
  try {
    const { glId } = await req.json();

    if (!glId) {
      return NextResponse.json(
        { error: "Missing grocery list ID (glId)." },
        { status: 400 }
      );
    }

    // Get userId from cookie
    const userIdCookie = req.cookies.get("userId")?.value;
    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const userId = Number(userIdCookie);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    // Delete all products from the specified grocery list for this user
    await pool.query(
      "DELETE FROM groceryProduct WHERE glId = ? AND UserId = ?",
      [glId, userId]
    );

    return NextResponse.json(
      { success: true, message: "Grocery list cleared successfully." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error deleting grocery list:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
