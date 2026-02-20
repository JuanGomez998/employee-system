import express from "express";
import {
  loginController,
  registerController,
  getCurrentUserController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

/**
 * POST /api/auth/login
 * Public endpoint - Login with username and password
 */
router.post("/login", loginController);

/**
 * POST /api/auth/register
 * Admin only - Create new user for admin access
 */
router.post("/register", authMiddleware, registerController);

/**
 * GET /api/auth/me
 * Protected - Get current authenticated user info
 */
router.get("/me", authMiddleware, getCurrentUserController);

export default router;
