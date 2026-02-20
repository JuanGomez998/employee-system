"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = exports.checkOut = exports.checkIn = void 0;
const db_1 = require("../db");
const resolveCedula = async (cedula) => {
    const normalizedCedula = cedula.trim().toUpperCase();
    if (!normalizedCedula) {
        throw new Error("Employee cedula is required");
    }
    const byCedula = await db_1.pool.query("SELECT cedula FROM employees WHERE cedula = $1", [normalizedCedula]);
    if (byCedula.rows.length > 0) {
        return byCedula.rows[0].cedula;
    }
    throw new Error("Employee not found");
};
const checkIn = async (cedula) => {
    const employeeCedula = await resolveCedula(cedula);
    const existing = await db_1.pool.query("SELECT * FROM attendance WHERE employee_cedula = $1 AND attendance_date = CURRENT_DATE", [employeeCedula]);
    if (existing.rows.length > 0) {
        throw new Error("Employee already checked in today");
    }
    const result = await db_1.pool.query("INSERT INTO attendance (employee_cedula, attendance_date, check_in_time) VALUES ($1, CURRENT_DATE, NOW()) RETURNING *", [employeeCedula]);
    return result.rows[0];
};
exports.checkIn = checkIn;
const checkOut = async (cedula) => {
    const employeeCedula = await resolveCedula(cedula);
    const existing = await db_1.pool.query("SELECT * FROM attendance WHERE employee_cedula = $1 AND attendance_date = CURRENT_DATE", [employeeCedula]);
    if (existing.rows.length === 0) {
        throw new Error("Employee has not checked in today");
    }
    if (existing.rows[0].check_out_time) {
        throw new Error("Employee already checked out today");
    }
    const result = await db_1.pool.query(`UPDATE attendance
     SET check_out_time = NOW(),
         total_hours = ROUND(EXTRACT(EPOCH FROM (NOW() - check_in_time))::numeric / 3600, 2),
         updated_at = NOW()
     WHERE employee_cedula = $1 AND attendance_date = CURRENT_DATE
     RETURNING *`, [employeeCedula]);
    return result.rows[0];
};
exports.checkOut = checkOut;
const getStatus = async (cedula) => {
    const employeeCedula = await resolveCedula(cedula);
    const result = await db_1.pool.query("SELECT * FROM attendance WHERE employee_cedula = $1 AND attendance_date = CURRENT_DATE", [employeeCedula]);
    if (result.rows.length === 0) {
        return {
            checkedIn: false,
            checkedOut: false,
        };
    }
    const record = result.rows[0];
    return {
        checkedIn: true,
        checkedOut: !!record.check_out_time,
    };
};
exports.getStatus = getStatus;
