import { pool } from "../db";
import { generateToken, JWTPayload } from "../utils/jwt";

const DEFAULT_ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || "1001";
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "1001@test.local";
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "1001";

/**
 * User login
 * @param username - Username
 * @param password - Plain text password (should be hashed in production)
 * @returns Token and user info
 */
export const login = async (username: string, password: string) => {
  const normalizedUser = username.trim();
  const normalizedPass = password.trim();

  // Query user from database
  const result = await pool.query(
    "SELECT id, username, email, password_hash, role, employee_cedula, is_active FROM users WHERE (username = $1 OR email = $1) AND is_active = TRUE",
    [normalizedUser]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check password (in production, use bcrypt)
  // For now, simple string comparison
  const passwordMatch = user.password_hash === normalizedPass;

  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate JWT token
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    employee_cedula: user.employee_cedula,
  };

  const token = generateToken(payload);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      employee_cedula: user.employee_cedula,
    },
  };
};

/**
 * Register new user (admin only)
 */
export const register = async (
  username: string,
  email: string,
  password: string,
  role: "admin" | "employee" = "employee",
  employee_cedula?: string
) => {
  // Check if user already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE username = $1 OR email = $2",
    [username, email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("Username or email already exists");
  }

  // In production, hash password with bcrypt
  // For now, store plain password
  const result = await pool.query(
    "INSERT INTO users (username, email, password_hash, role, employee_cedula) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role, employee_cedula",
    [username, email, password, role, employee_cedula]
  );

  const user = result.rows[0];

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    employee_cedula: user.employee_cedula,
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number) => {
  const result = await pool.query(
    "SELECT id, username, email, role, employee_cedula FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

/**
 * Ensure a default admin exists for local development.
 */
export const ensureDefaultAdminUser = async () => {
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1",
    [DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_EMAIL]
  );

  if (existingUser.rows.length > 0) {
    return;
  }

  await pool.query(
    "INSERT INTO users (username, email, password_hash, role, employee_cedula, is_active) VALUES ($1, $2, $3, 'admin', NULL, TRUE)",
    [DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD]
  );
};
