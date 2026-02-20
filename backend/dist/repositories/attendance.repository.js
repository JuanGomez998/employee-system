"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgAttendanceRepository = void 0;
class PgAttendanceRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async findTodayByCedula(cedula, date) {
        const result = await this.pool.query(`SELECT id, employee_cedula, attendance_date, check_in_time, check_out_time, total_hours
       FROM attendance
       WHERE employee_cedula = $1 AND attendance_date = $2`, [cedula, date]);
        return result.rows[0] ?? null;
    }
    async createEntry(cedula, date, checkInTime) {
        const result = await this.pool.query(`INSERT INTO attendance (employee_cedula, attendance_date, check_in_time)
       VALUES ($1, $2, $3)
       RETURNING id, employee_cedula, attendance_date, check_in_time, check_out_time, total_hours`, [cedula, date, checkInTime]);
        return result.rows[0];
    }
    async registerExit(attendanceId, checkOutTime, totalHours) {
        const result = await this.pool.query(`UPDATE attendance
       SET check_out_time = $1,
           total_hours = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, employee_cedula, attendance_date, check_in_time, check_out_time, total_hours`, [checkOutTime, totalHours, attendanceId]);
        return result.rows[0];
    }
    async findHistoryByCedula(cedula, limit) {
        const params = limit ? [cedula, limit] : [cedula];
        const limitClause = limit ? "LIMIT $2" : "";
        const result = await this.pool.query(`SELECT id, employee_cedula, attendance_date, check_in_time, check_out_time, total_hours
       FROM attendance
       WHERE employee_cedula = $1
       ORDER BY attendance_date DESC, check_in_time DESC
       ${limitClause}`, params);
        return result.rows;
    }
}
exports.PgAttendanceRepository = PgAttendanceRepository;
