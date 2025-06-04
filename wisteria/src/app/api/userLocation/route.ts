import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";
import type { RowDataPacket } from "mysql2/promise";

interface UserRow {
  UserLocationId: number;
}
interface LocationRow {
  Latitude: number;
  Longitude: number;
}

type UserRowPacket = UserRow & RowDataPacket;
type LocationRowPacket = LocationRow & RowDataPacket;

export async function GET(req: NextRequest) {
  // 1) pull userId out of the cookies
  const userIdCookie = req.cookies.get("userId")?.value;
  if (!userIdCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = Number(userIdCookie);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  // 2) fetch the user row (with UserLocationId)
  const [userRows] = await pool.query<UserRowPacket[]>(
    `SELECT UserLocationId FROM userData WHERE UserId = ?`,
    [userId]
  );
  if (!userRows || userRows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userLocationId = userRows[0].UserLocationId;

  // 3) fetch the actual location row (latitude, longitude)
  const [locationRows] = await pool.query<LocationRowPacket[]>(
    `SELECT Latitude, Longitude FROM locationData WHERE LocationId = ?`,
    [userLocationId]
  );
  if (!locationRows || locationRows.length === 0) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }
  const { Latitude, Longitude } = locationRows[0];
  return NextResponse.json({ latitude: Number(Latitude), longitude: Number(Longitude) }, { status: 200 });
}
