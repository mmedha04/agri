// // pages/api/items.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getPool } from "../../../lib/db";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const pool = getPool();
      const result = await pool.query("SELECT * FROM userData");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
