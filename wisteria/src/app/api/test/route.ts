import { RowDataPacket } from "mysql2";
import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

type Data = RowDataPacket & { current_time: string };

export async function GET() {
  try {
    const [rows] = await pool.query<Data[]>(`SELECT NOW() AS \`current_time\``);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("🔴 DB Error:", err);
    console.log("🔑 ENV:", {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT,
    });
    return NextResponse.json(
      { error: "Database connection failed." },
      { status: 500 }
    );
  }
}
