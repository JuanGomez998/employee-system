/**
 * Payroll Routes
 * Routes for payroll endpoint
 */

import { Router } from "express";
import { generatePayrollReport } from "../controllers/payrollController";

const router = Router();

/**
 * POST /api/payroll/generate
 * Generate payroll report in Excel format
 *
 * Body:
 * {
 *   startDate: "2026-01-01"
 *   endDate: "2026-01-31"
 *   employeeCedulas?: ["100000001", "100000002"] (optional)
 * }
 */
router.post("/generate", generatePayrollReport);

export default router;
