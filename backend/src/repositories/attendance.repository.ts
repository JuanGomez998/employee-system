import { Pool } from "pg";

export interface Attendance {
  id: number;
  employee_cedula: string;
  attendance_date: string;
  check_in_time: string;
  check_out_time: string | null;
  total_hours: number | null;
}

export interface AttendanceRepository {
  findTodayByCedula(cedula: string, date: string): Promise<Attendance | null>;
  createEntry(cedula: string, date: string, checkInTime: Date): Promise<Attendance>;
  registerExit(attendanceId: number, checkOutTime: Date, totalHours: number): Promise<Attendance>;
  findHistoryByCedula(cedula: string, limit?: number): Promise<Attendance[]>;
}

export class PgAttendanceRepository implements AttendanceRepository {
  constructor(private readonly pool: Pool) {}

  async findTodayByCedula(cedula: string, date: string): Promise<Attendance | null> {
    const result = await this.pool.query(
      `SELECT id, employee_cedula, attendance_date, check_in_time, check_out_time, total_hours
       FROM attendance
       WHERE employee_cedula = $1 AND attendance_date = $2`,
      [cedula, date]
    );

    return result.rows[0] ?? null;
  }

  async createEntry(cedula: string, date: string, checkInTime: Date): Promise<Attendance> {
    const result = await this.pool.query(
      `INSERT INTO attendance (employee_cedula, attendance_date, check_in_time)
       VALUES ($1, $2, $3)
       RETURNING id, employee_cedula, attendance_date, check_in_time, check_out_time, total_hours`,
      [cedula, date, checkInTime]
    );

    return result.rows[0];
  }

  async registerExit(attendanceId: number, checkOutTime: Date, totalHours: number): Promise<Attendance> {
    const result = await this.pool.query(
      `UPDATE attendance
       SET check_out_time = $1,
           total_hours = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, employee_cedula, attendance_date, check_in_time, check_out_time, total_hours`,
      [checkOutTime, totalHours, attendanceId]
    );

    return result.rows[0];
  }

  async findHistoryByCedula(cedula: string, limit?: number): Promise<Attendance[]> {
    const params = limit ? [cedula, limit] : [cedula];
    const limitClause = limit ? "LIMIT $2" : "";

    const result = await this.pool.query(
      `SELECT id, employee_cedula, attendance_date, check_in_time, check_out_time, total_hours
       FROM attendance
       WHERE employee_cedula = $1
       ORDER BY attendance_date DESC, check_in_time DESC
       ${limitClause}`,
      params
    );

    return result.rows;
  }
}
