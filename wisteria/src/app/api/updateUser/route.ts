// src/app/api/updateUser/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { RowDataPacket, OkPacket } from "mysql2/promise";
import pool from "../../../../lib/db";

interface LocationRow extends RowDataPacket {
  LocationId: number;
}

export async function POST(req: NextRequest) {
  // 1) require auth
  const userIdCookie = req.cookies.get("userId")?.value;
  if (!userIdCookie) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = Number(userIdCookie);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  // 2) parse body
  const { firstName, lastName, newEmail, city, country } = await req.json();
  if (!firstName || !lastName || !newEmail || !city || !country) {
    return NextResponse.json(
      { error: "Missing one of: firstName, lastName, newEmail, city, country" },
      { status: 400 }
    );
  }

  // 3) lookup or create location
  const [locRows] = await pool.query<LocationRow[]>(
    `SELECT LocationId 
       FROM locationData 
      WHERE City = ? AND Country = ?`,
    [city.trim(), country.trim()]
  );
  let locationId: number;
  if (locRows.length) {
    locationId = locRows[0].LocationId;
  } else {
    const [insertRes] = await pool.query<OkPacket>(
      `INSERT INTO locationData (City, Country) VALUES (?, ?)`,
      [city.trim(), country.trim()]
    );
    locationId = insertRes.insertId;
  }

  // 4) update the userData row
  const [updateRes] = await pool.query<OkPacket>(
    `UPDATE userData
        SET FirstName       = ?,
            LastName        = ?,
            EmailId         = ?,
            UserLocationId  = ?
      WHERE UserId = ?`,
    [firstName.trim(), lastName.trim(), newEmail.trim(), locationId, userId]
  );

  if (updateRes.affectedRows === 0) {
    return NextResponse.json(
      { error: "User not found or no changes applied" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Profile updated successfully" });
}
