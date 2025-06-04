import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { sourceListId, targetListId, productId } = await req.json();

    if (!sourceListId || !targetListId || !productId) {
      return NextResponse.json(
        { error: "Missing sourceListId, targetListId, or productId." },
        { status: 400 }
      );
    }

    // Get userId from cookie
    const userIdCookie = req.cookies.get("userId")?.value;
    if (!userIdCookie) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const userId = Number(userIdCookie);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    // Move the product using the stored procedure
    await pool.query(
      `CALL MoveProductBetweenLists(?, ?, ?, ?)`,
      [userId, productId, sourceListId, targetListId]
    );

    // Optionally, fetch updated target list if you want (similar to your delete example)
    const [resultSets] = await pool.query<any[]>(
      "CALL GetGroceryListWithEnvironmentalCostAndFuel(?, ?)",
      [userId, targetListId]
    );

    return NextResponse.json(
      { success: true, products: resultSets[0] },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error moving product:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
