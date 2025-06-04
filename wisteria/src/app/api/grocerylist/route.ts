import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    // ── 1. Retrieve & validate user ────────────────────────────
    const userIdCookie = req.cookies.get("userId")?.value;
    if (!userIdCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = Number(userIdCookie);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid userId." }, { status: 400 });
    }

    // ── 2. Get glId from query string ──────────────────────────
    const { searchParams } = new URL(req.url);
    const glIdRaw = searchParams.get("glId");
    if (!glIdRaw) {
      return NextResponse.json(
        { error: "Missing required query parameter glId." },
        { status: 400 }
      );
    }

    const glId = Number(glIdRaw);
    if (Number.isNaN(glId)) {
      return NextResponse.json({ error: "Invalid glId." }, { status: 400 });
    }

    // ── 3. Call stored procedure & return rows ─────────────────
    const [resultSets] = await pool.query<any[]>(
      `CALL GetGroceryListWithEnvironmentalCostAndFuel(?, ?)`,
      [userId, glId]
    );

    return NextResponse.json(
      { success: true, products: resultSets[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/grocerylist:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
