import { Response } from "express";
import * as authService from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * Login endpoint
 * POST /api/auth/login
 * Body: { username, password }
 */
export const loginController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password required" });
      return;
    }

    const result = await authService.login(String(username), String(password));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid credentials" });
  }
};

/**
 * Register endpoint (admin only)
 * POST /api/auth/register
 */
export const registerController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { username, email, password, role, employee_cedula } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const user = await authService.register(
      username,
      email,
      password,
      role || "employee",
      employee_cedula
    );

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error registering user" });
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
export const getCurrentUserController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No user information" });
      return;
    }

    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user info" });
  }
};
