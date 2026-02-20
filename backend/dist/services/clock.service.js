"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceByDateRange = exports.getAttendanceByDate = exports.getEmployeeAttendance = exports.getAttendanceSummary = exports.checkOut = exports.checkIn = exports.getTodayAttendance = exports.getEmployeeByCedula = void 0;
const db_1 = require("../db");
const getEmployeeByCedula = async (cedula) => {
    const normalizedCedula = cedula.trim().toUpperCase();
    const result = await db_1.pool.query("SELECT cedula, name, email, position FROM employees WHERE cedula = $1", [normalizedCedula]);
    return result.rows[0] || null;
};
exports.getEmployeeByCedula = getEmployeeByCedula;
const getTodayAttendance = async (cedula, date) => {
    const result = await db_1.pool.query(`SELECT * FROM attendance
     WHERE employee_cedula = $1 AND attendance_date = $2`, [cedula, date]);
    return result.rows[0] || null;
};
exports.getTodayAttendance = getTodayAttendance;
const checkIn = async (cedula, checkInTime) => {
    const normalizedCedula = cedula.trim().toUpperCase();
    const today = checkInTime.toISOString().split("T")[0];
    const employee = await (0, exports.getEmployeeByCedula)(normalizedCedula);
    if (!employee) {
        throw new Error(`Employee with cedula ${normalizedCedula} not found`);
    }
    const existing = await (0, exports.getTodayAttendance)(normalizedCedula, today);
    if (existing) {
        throw new Error("Employee already checked in today");
    }
    const result = await db_1.pool.query(`INSERT INTO attendance (employee_cedula, attendance_date, check_in_time)
     VALUES ($1, $2, $3)
     RETURNING *`, [normalizedCedula, today, checkInTime]);
    return result.rows[0];
};
exports.checkIn = checkIn;
const checkOut = async (cedula, checkOutTime) => {
    const normalizedCedula = cedula.trim().toUpperCase();
    const today = checkOutTime.toISOString().split("T")[0];
    const attendance = await (0, exports.getTodayAttendance)(normalizedCedula, today);
    if (!attendance) {
        throw new Error("No check-in record found for today");
    }
    if (attendance.check_out_time) {
        throw new Error("Employee already checked out today");
    }
    const checkInTime = new Date(attendance.check_in_time);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    const result = await db_1.pool.query(`UPDATE attendance
     SET check_out_time = $1, total_hours = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`, [checkOutTime, totalHours, attendance.id]);
    return {
        attendance: result.rows[0],
        totalHours,
    };
};
exports.checkOut = checkOut;
const getAttendanceSummary = async (cedula, startDate, endDate) => {
    const result = await db_1.pool.query(`SELECT
       COUNT(*) as total_days,
       COUNT(CASE WHEN check_out_time IS NOT NULL THEN 1 END) as completed_days,
       SUM(total_hours) as total_hours
     FROM attendance
     WHERE employee_cedula = $1
     AND attendance_date BETWEEN $2 AND $3`, [cedula, startDate, endDate]);
    return result.rows[0];
};
exports.getAttendanceSummary = getAttendanceSummary;
const getEmployeeAttendance = async (cedula, limit) => {
    const limitClause = limit ? `LIMIT $2` : "";
    const params = limit ? [cedula, limit] : [cedula];
    const result = await db_1.pool.query(`SELECT * FROM attendance
     WHERE employee_cedula = $1
     ORDER BY attendance_date DESC
     ${limitClause}`, params);
    return result.rows;
};
exports.getEmployeeAttendance = getEmployeeAttendance;
const getAttendanceByDate = async (date) => {
    const result = await db_1.pool.query(`SELECT a.*, e.name as employee_name, e.position, e.cedula
     FROM attendance a
     JOIN employees e ON a.employee_cedula = e.cedula
     WHERE a.attendance_date = $1
     ORDER BY a.check_in_time ASC`, [date]);
    return result.rows;
};
exports.getAttendanceByDate = getAttendanceByDate;
const getAttendanceByDateRange = async (startDate, endDate) => {
    const result = await db_1.pool.query(`SELECT a.*, e.name as employee_name, e.position, e.cedula
     FROM attendance a
     JOIN employees e ON a.employee_cedula = e.cedula
     WHERE a.attendance_date BETWEEN $1 AND $2
     ORDER BY a.attendance_date DESC, a.check_in_time ASC`, [startDate, endDate]);
    return result.rows;
};
exports.getAttendanceByDateRange = getAttendanceByDateRange;
