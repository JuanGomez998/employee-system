"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
/**
 * POST /api/auth/login
 * Public endpoint - Login with username and password
 */
router.post("/login", auth_controller_1.loginController);
/**
 * POST /api/auth/register
 * Admin only - Create new user for admin access
 */
router.post("/register", auth_1.authMiddleware, auth_controller_1.registerController);
/**
 * GET /api/auth/me
 * Protected - Get current authenticated user info
 */
router.get("/me", auth_1.authMiddleware, auth_controller_1.getCurrentUserController);
exports.default = router;
