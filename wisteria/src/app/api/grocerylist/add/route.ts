import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const {
      glId,
      productId,
      quantity,
      locationId: overrideLocId,
      city,
      country,
    } = await req.json();

    if (!glId || !productId || !quantity) {
      return NextResponse.json(
        { error: "Missing glId, productId, or quantity." },
        { status: 400 }
      );
    }

    // userId from cookie
    const userIdCookie = req.cookies.get("userId")?.value;
    if (!userIdCookie) {
      return NextResponse.json({ error: "Not auth." }, { status: 401 });
    }
    const userId = Number(userIdCookie);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user." }, { status: 400 });
    }

    // pick locationId
    let locationId: number;
    if (overrideLocId) {
      locationId = overrideLocId;
    } else {
      // fallback: lookup by city/country
      let sql = "SELECT LocationId FROM locationData WHERE ";
      const p: any[] = [];
      if (city && country) {
        sql += "City = ? AND Country = ?";
        p.push(city, country);
      } else if (country) {
        sql += "Country = ?";
        p.push(country);
      } else if (city) {
        sql += "City = ?";
        p.push(city);
      } else {
        return NextResponse.json(
          { error: "Must supply city or country." },
          { status: 400 }
        );
      }
      sql += " LIMIT 1";
      const [rows] = await pool.query<{ LocationId: number }[]>(sql, p);
      if (!rows.length) {
        return NextResponse.json(
          { error: "No matching location." },
          { status: 404 }
        );
      }
      locationId = rows[0].LocationId;
    }

    // insert
    await pool.query(
      `
      INSERT INTO groceryProduct
        (glId, UserId, ProductId, Quantity, LocationId)
      VALUES (?, ?, ?, ?, ?)
      `,
      [glId, userId, productId, quantity, locationId]
    );

    // return fresh snapshot
    const [resultSets] = await pool.query<any[]>(
      `CALL GetGroceryListWithEnvironmentalCostAndFuel(?, ?)`,
      [userId, glId]
    );
    return NextResponse.json(
      { success: true, products: resultSets[0] },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Already in this list." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
