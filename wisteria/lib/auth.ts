import { SignJWT, jwtVerify } from "jose";

// Convert the secret string to a Uint8Array for jose
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export async function signToken(payload: { userId: number }) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET);
}

// For password hashing, we need to use a different approach since bcrypt isn't Edge-compatible
// Using a simple implementation for demonstration - in production, use a proper Edge-compatible hashing library
export async function hashPassword(pw: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pw + process.env.JWT_SECRET); // Salt with your secret
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(pw: string, hash: string) {
  const newHash = await hashPassword(pw);
  return newHash === hash;
}

export async function verifyToken(token: string) {
  try {
    console.log("SECRET available:", SECRET.length > 0);
    console.log("SECRET length:", SECRET.length);

    const { payload } = await jwtVerify(token, SECRET);
    console.log("Token decoded successfully:", payload);

    return payload as { userId: number; iat: number; exp: number };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}
