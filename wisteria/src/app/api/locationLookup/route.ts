// src/app/api/locationSearch/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import pool from "../../../../lib/db";

interface LocationRow extends RowDataPacket {
  Latitude: number;
  Longitude: number;
}

export async function POST(req: NextRequest) {
  try {
    /* ---------- 1. Validate payload ---------- */
    const { city, country } = await req.json() as {
      city?: string;
      country?: string;
    };

    if (!country) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 },
      );
    }

    /* ---------- 2. Build query & params ---------- */
    // - Use LIMIT 1 so we never accidentally read a huge result set.
    // - If the caller supplies a city, we’ll filter by it; otherwise we fall back to a country-only lookup.
    const sql =
      city && country === "United States"
        ? "SELECT Latitude, Longitude FROM locationData WHERE city = ? AND country = ? LIMIT 1"
        : "SELECT Latitude, Longitude FROM locationData WHERE country = ? LIMIT 1";

    const params = city && country === "United States" ? [city, country] : [country];

    /* ---------- 3. Execute query ---------- */
    const [rows] = await pool.execute<LocationRow[]>(sql, params);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 },
      );
    }

    /* ---------- 4. Return clean response ---------- */
    const { Latitude: latitude, Longitude: longitude } = rows[0];
    return NextResponse.json({ latitude: Number(latitude), longitude: Number(longitude) }, { status: 200 });
  } catch (err) {
    console.error("Location lookup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
