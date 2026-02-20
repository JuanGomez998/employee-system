"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusController = exports.verifyEmployeeController = exports.punchController = void 0;
const clockService = __importStar(require("../services/clock.service"));
const punchController = async (req, res) => {
    try {
        const { cedula } = req.body;
        if (!cedula || typeof cedula !== "string") {
            res.status(400).json({
                success: false,
                message: "Cedula is required",
            });
            return;
        }
        const sanitizedCedula = cedula.trim();
        if (!/^\d+$/.test(sanitizedCedula)) {
            res.status(400).json({
                success: false,
                message: "Cedula must contain numbers only",
            });
            return;
        }
        const employee = await clockService.getEmployeeByCedula(sanitizedCedula);
        if (!employee) {
            res.status(404).json({
                success: false,
                message: `Employee not found with cedula: ${sanitizedCedula}`,
            });
            return;
        }
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const todayRecord = await clockService.getTodayAttendance(sanitizedCedula, today);
        let result;
        let action;
        if (!todayRecord) {
            const attendance = await clockService.checkIn(sanitizedCedula, now);
            action = "check_in";
            result = {
                success: true,
                action,
                message: `Welcome ${employee.name}! Check-in registered at ${now.toLocaleTimeString()}`,
                data: {
                    employee: {
                        cedula: employee.cedula,
                        name: employee.name,
                        position: employee.position,
                    },
                    attendance: {
                        id: attendance.id,
                        check_in_time: attendance.check_in_time,
                        check_out_time: attendance.check_out_time,
                    },
                    timestamp: now.toISOString(),
                },
            };
        }
        else if (!todayRecord.check_out_time) {
            const { attendance, totalHours } = await clockService.checkOut(sanitizedCedula, now);
            action = "check_out";
            result = {
                success: true,
                action,
                message: `Check-out registered. Total hours: ${totalHours}h`,
                data: {
                    employee: {
                        cedula: employee.cedula,
                        name: employee.name,
                        position: employee.position,
                    },
                    attendance: {
                        id: attendance.id,
                        check_in_time: attendance.check_in_time,
                        check_out_time: attendance.check_out_time,
                        total_hours: totalHours,
                    },
                    timestamp: now.toISOString(),
                },
            };
        }
        else {
            result = {
                success: false,
                action: "already_completed",
                message: `Shift already completed today. Check-in: ${todayRecord.check_in_time}, Check-out: ${todayRecord.check_out_time}`,
                data: {
                    employee: {
                        cedula: employee.cedula,
                        name: employee.name,
                        position: employee.position,
                    },
                    attendance: {
                        id: todayRecord.id,
                        check_in_time: todayRecord.check_in_time,
                        check_out_time: todayRecord.check_out_time,
                        total_hours: todayRecord.total_hours,
                    },
                },
            };
        }
        const statusCode = result.success ? 200 : 409;
        res.status(statusCode).json(result);
    }
    catch (error) {
        console.error("Punch error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Error processing attendance",
        });
    }
};
exports.punchController = punchController;
const verifyEmployeeController = async (req, res) => {
    try {
        const cedulaParam = req.params.cedula;
        const rawCedula = Array.isArray(cedulaParam) ? cedulaParam[0] : cedulaParam;
        if (!rawCedula) {
            res.status(400).json({ message: "Cedula is required" });
            return;
        }
        const sanitizedCedula = rawCedula.trim();
        if (!/^\d+$/.test(sanitizedCedula)) {
            res.status(400).json({ message: "Cedula must contain numbers only" });
            return;
        }
        const employee = await clockService.getEmployeeByCedula(sanitizedCedula);
        if (!employee) {
            res.status(404).json({
                exists: false,
                message: "Employee not found",
            });
            return;
        }
        res.json({
            exists: true,
            employee: {
                cedula: employee.cedula,
                name: employee.name,
                position: employee.position,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error verifying employee" });
    }
};
exports.verifyEmployeeController = verifyEmployeeController;
const getStatusController = async (req, res) => {
    try {
        const cedulaParam = req.params.cedula;
        const rawCedula = Array.isArray(cedulaParam) ? cedulaParam[0] : cedulaParam;
        if (!rawCedula) {
            res.status(400).json({ message: "Cedula is required" });
            return;
        }
        const sanitizedCedula = rawCedula.trim();
        if (!/^\d+$/.test(sanitizedCedula)) {
            res.status(400).json({ message: "Cedula must contain numbers only" });
            return;
        }
        const today = new Date().toISOString().split("T")[0];
        const todayRecord = await clockService.getTodayAttendance(sanitizedCedula, today);
        if (!todayRecord) {
            res.json({
                status: "not_checked_in",
                message: "Not checked in today",
            });
            return;
        }
        if (!todayRecord.check_out_time) {
            res.json({
                status: "checked_in",
                check_in_time: todayRecord.check_in_time,
                message: "Checked in, waiting for check-out",
            });
            return;
        }
        res.json({
            status: "completed",
            check_in_time: todayRecord.check_in_time,
            check_out_time: todayRecord.check_out_time,
            total_hours: todayRecord.total_hours,
            message: "Shift completed",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching status" });
    }
};
exports.getStatusController = getStatusController;
