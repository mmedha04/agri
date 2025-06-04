import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { locationIds } = body;

    if (
      !locationIds ||
      !Array.isArray(locationIds) ||
      locationIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid locationIds parameter. Expected non-empty array." },
        { status: 400 }
      );
    }

    // Prepare placeholders for the IN clause
    const placeholders = locationIds.map(() => "?").join(",");

    // Execute query to fetch location data
    const [rows] = await pool.query<any[]>(
      `SELECT LocationId, City, Country, Latitude, Longitude 
       FROM locationData 
       WHERE LocationId IN (${placeholders})`,
      locationIds
    );

    return NextResponse.json(
      { success: true, locations: rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/locations:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
