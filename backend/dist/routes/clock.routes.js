"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clock_controller_1 = require("../controllers/clock.controller");
const router = express_1.default.Router();
/**
 * POST /api/clock/punch
 * Public endpoint - Clock in or out
 * Body: { cedula }
 */
router.post("/punch", clock_controller_1.punchController);
/**
 * GET /api/clock/verify/:cedula
 * Public endpoint - Verify employee exists
 */
router.get("/verify/:cedula", clock_controller_1.verifyEmployeeController);
/**
 * GET /api/clock/status/:cedula
 * Public endpoint - Get today's attendance status
 */
router.get("/status/:cedula", clock_controller_1.getStatusController);
exports.default = router;
