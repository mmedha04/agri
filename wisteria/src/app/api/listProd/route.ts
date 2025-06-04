import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "../../../../lib/db";

export async function POST(req: NextRequest) {
  const { keyword, city, country } = await req.json();
  if (!keyword || keyword.length < 2) {
    return NextResponse.json({ products: [] });
  }

  let sql = `
    SELECT 
      pd.ProductId,
      pd.ProductName,
      ld.LocationId,
      ld.City,
      ld.Country
    FROM productData pd
    JOIN locationData ld ON pd.LocationId = ld.LocationId
    WHERE pd.ProductName LIKE ?
  `;
  const params: any[] = [`%${keyword}%`];

  if (country) {
    sql += " AND ld.Country = ?";
    params.push(country);
  }
  if (city) {
    sql += " AND ld.City = ?";
    params.push(city);
  }

  sql += " LIMIT 20";

  try {
    const [rows] = await pool.query(sql, params);
    return NextResponse.json({ products: rows }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
