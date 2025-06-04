import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import pool from "../../../../lib/db";

interface UserRow {
  FirstName: string;
  LastName: string;
  EmailId: string;
  UserLocationId: number;
}

type UserRowPacket = UserRow & RowDataPacket;

interface LocationRow {
  City: string;
  Country: string;
}

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
    `SELECT FirstName, LastName, EmailId, UserLocationId
     FROM userData
     WHERE UserId = ?`,
    [userId]
  );

  if (userRows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const { FirstName, LastName, EmailId, UserLocationId } = userRows[0];

  // 3) fetch the location row
  const [locRows] = await pool.query<LocationRowPacket[]>(
    `SELECT City, Country
     FROM locationData
     WHERE LocationId = ?`,
    [UserLocationId]
  );

  if (locRows.length === 0) {
    return NextResponse.json(
      { error: "User location not found" },
      { status: 404 }
    );
  }
  const { City, Country } = locRows[0];

  // 4) return JSON in camelCase
  return NextResponse.json(
    {
      firstName: FirstName,
      lastName: LastName,
      email: EmailId,
      city: City,
      country: Country,
    },
    { status: 200 }
  );
}
