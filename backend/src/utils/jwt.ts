import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const TOKEN_EXPIRY = "24h";

export interface JWTPayload {
  id: number;
  username: string;
  email: string;
  role: "admin" | "employee";
  employee_cedula?: string;
}

/**
 * Generate JWT token for user
 * @param payload - User data to encode
 * @returns Signed JWT token
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: TOKEN_EXPIRY,
  });
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Token without "Bearer " prefix
 */
export const extractToken = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  
  return parts[1];
};
