import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashPassword, signToken } from "../../../../../lib/auth";
import pool from "../../../../../lib/db";
import { RowDataPacket } from "mysql2";

interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  city: string;
  country: string;
  grocList: boolean;
}

interface LocationRow extends RowDataPacket {
  LocationId: number;
}

interface IdRow extends RowDataPacket {
  id: number;
}

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password, city, country, grocList } =
    (await req.json()) as RegisterBody;

  // — minimal server validation —
  if (!email.includes("@") || password.length < 8) {
    return NextResponse.json(
      { error: "Invalid email or password format." },
      { status: 422 }
    );
  }

  // 1) look up locationId
  const [locRows] = await pool.query<LocationRow[]>(
    "SELECT LocationId FROM locationData WHERE City = ? AND Country = ?",
    [city, country]
  );

  if (locRows.length === 0) {
    return NextResponse.json(
      { error: "Unknown city/country combination." },
      { status: 400 }
    );
  }

  const locationId = locRows[0].LocationId;

  // 2) hash the password - now using async version
  const hashed = await hashPassword(password);

  // 3) call stored procedure AddNewUser
  try {
    await pool.query("CALL AddNewUser(?, ?, ?, ?, ?, ?)", [
      firstName,
      lastName,
      email,
      hashed,
      locationId,
      grocList,
    ]);
  } catch (err: unknown) {
    // If the SP SIGNALs an error, it comes here
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Could not create user." },
      { status: 400 }
    );
  }

  // 4) sign JWT & set cookie - now using async version
  const [idResult] = await pool.query<IdRow[]>("SELECT LAST_INSERT_ID() as id");
  const userId = idResult[0].id;

  // Now we await the token generation since signToken is async
  const token = await signToken({
    userId,
  });

  const res = NextResponse.json({ success: true }, { status: 201 });
  res.cookies.set("token", token, {
    httpOnly: true,
    maxAge: Number(process.env.COOKIE_MAX_AGE),
    path: "/",
    sameSite: "lax",
  });
  res.cookies.set("userId", userId.toString(), {
    httpOnly: true,
    maxAge: Number(process.env.COOKIE_MAX_AGE),
    path: "/",
    sameSite: "lax",
  });

  return res;
}
