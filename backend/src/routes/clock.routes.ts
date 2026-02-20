import express from "express";
import {
  punchController,
  verifyEmployeeController,
  getStatusController,
} from "../controllers/clock.controller";

const router = express.Router();

/**
 * POST /api/clock/punch
 * Public endpoint - Clock in or out
 * Body: { cedula }
 */
router.post("/punch", punchController);

/**
 * GET /api/clock/verify/:cedula
 * Public endpoint - Verify employee exists
 */
router.get("/verify/:cedula", verifyEmployeeController);

/**
 * GET /api/clock/status/:cedula
 * Public endpoint - Get today's attendance status
 */
router.get("/status/:cedula", getStatusController);

export default router;
