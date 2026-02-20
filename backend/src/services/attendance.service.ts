import { pool } from "../db";

const resolveCedula = async (cedula: string) => {
  const normalizedCedula = cedula.trim().toUpperCase();

  if (!normalizedCedula) {
    throw new Error("Employee cedula is required");
  }

  const byCedula = await pool.query(
    "SELECT cedula FROM employees WHERE cedula = $1",
    [normalizedCedula]
  );

  if (byCedula.rows.length > 0) {
    return byCedula.rows[0].cedula as string;
  }

  throw new Error("Employee not found");
};

export const checkIn = async (cedula: string) => {
  const employeeCedula = await resolveCedula(cedula);

  const existing = await pool.query(
    "SELECT * FROM attendance WHERE employee_cedula = $1 AND attendance_date = CURRENT_DATE",
    [employeeCedula]
  );

  if (existing.rows.length > 0) {
    throw new Error("Employee already checked in today");
  }

  const result = await pool.query(
    "INSERT INTO attendance (employee_cedula, attendance_date, check_in_time) VALUES ($1, CURRENT_DATE, NOW()) RETURNING *",
    [employeeCedula]
  );

  return result.rows[0];
};

export const checkOut = async (cedula: string) => {
  const employeeCedula = await resolveCedula(cedula);

  const existing = await pool.query(
    "SELECT * FROM attendance WHERE employee_cedula = $1 AND attendance_date = CURRENT_DATE",
    [employeeCedula]
  );

  if (existing.rows.length === 0) {
    throw new Error("Employee has not checked in today");
  }

  if (existing.rows[0].check_out_time) {
    throw new Error("Employee already checked out today");
  }

  const result = await pool.query(
    `UPDATE attendance
     SET check_out_time = NOW(),
         total_hours = ROUND(EXTRACT(EPOCH FROM (NOW() - check_in_time))::numeric / 3600, 2),
         updated_at = NOW()
     WHERE employee_cedula = $1 AND attendance_date = CURRENT_DATE
     RETURNING *`,
    [employeeCedula]
  );

  return result.rows[0];
};

export const getStatus = async (cedula: string) => {
  const employeeCedula = await resolveCedula(cedula);

  const result = await pool.query(
    "SELECT * FROM attendance WHERE employee_cedula = $1 AND attendance_date = CURRENT_DATE",
    [employeeCedula]
  );

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