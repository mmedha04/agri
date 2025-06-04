import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { glId, productId } = await req.json();

    if (!glId || !productId) {
      return NextResponse.json(
        { error: "Missing glId or productId." },
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

    // Delete the specific product from the grocery list
    await pool.query(
      "DELETE FROM groceryProduct WHERE glId = ? AND UserId = ? AND ProductId = ?",
      [glId, userId, productId]
    );

    // Return fresh snapshot of the list after deletion
    const [resultSets] = await pool.query<any[]>(
      "CALL GetGroceryListWithEnvironmentalCostAndFuel(?, ?)",
      [userId, glId]
    );

    return NextResponse.json(
      { success: true, products: resultSets[0] },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error deleting product:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}