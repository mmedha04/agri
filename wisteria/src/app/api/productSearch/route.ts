// src/app/api/productSearch/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../lib/db";

export async function POST(req: NextRequest) {
  const { keyword, city, country } = await req.json();

  if (!keyword || !country) {
    return NextResponse.json(
      { error: "Missing keyword or country" },
      { status: 400 }
    );
  }

  const userIdCookie = req.cookies.get("userId")?.value;
  if (!userIdCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = Number(userIdCookie);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  // run your stored proc
  const [resultSets] = await pool.query<any[][]>(
    `CALL SearchProductsWithDistance(?, ?, ?)`,
    [keyword, city || null, country]
  );

  const raw = Array.isArray(resultSets) ? resultSets[0] : [];

  const products = raw.map((p) => ({
    ProductId: p.ProductId,
    ProductName: p.ProductName,
    CarbonFootprint_per_kg: p.CarbonFootprint_per_kg,
    LandUse_per_kg: p.LandUse_per_kg,
    WaterUse_per_kg: p.WaterUse_per_kg,
    TotalEmissions: p.TotalEmissions,
    DistanceMiles: p.DistanceMiles,
    FuelUsageGallons: p.FuelUsageGallons,
    Location: {
      latitude: p.Latitude,
      longitude: p.Longitude,
    },
  }));

  return NextResponse.json({ products }, { status: 200 });
}
