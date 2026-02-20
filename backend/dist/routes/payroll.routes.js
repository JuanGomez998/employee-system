"use strict";
/**
 * Payroll Routes
 * Routes for payroll endpoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payrollController_1 = require("../controllers/payrollController");
const router = (0, express_1.Router)();
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
router.post("/generate", payrollController_1.generatePayrollReport);
exports.default = router;
