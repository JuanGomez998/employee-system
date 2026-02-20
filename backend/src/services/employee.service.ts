import { pool } from "../db";

export interface EmployeeInput {
  cedula: string;
  name: string;
  email: string;
  position: string;
}

const normalizeCedula = (cedula: string) => cedula.trim().toUpperCase();

export const getAll = async () => {
  const result = await pool.query(
    "SELECT cedula, name, email, position FROM employees ORDER BY name ASC"
  );
  return result.rows;
};

export const create = async (data: EmployeeInput) => {
  const cedula = normalizeCedula(data.cedula || "");
  const name = (data.name || "").trim();
  const email = (data.email || "").trim().toLowerCase();
  const position = (data.position || "").trim();

  if (!cedula || !name || !email || !position) {
    throw new Error("Missing required fields");
  }

  const duplicateCedula = await pool.query(
    "SELECT cedula FROM employees WHERE cedula = $1",
    [cedula]
  );

  if (duplicateCedula.rows.length > 0) {
    throw new Error("Cedula already exists");
  }

  const result = await pool.query(
    `INSERT INTO employees (cedula, name, email, position)
     VALUES ($1, $2, $3, $4)
     RETURNING cedula, name, email, position`,
    [cedula, name, email, position]
  );

  return result.rows[0];
};

export const update = async (cedula: string, data: Partial<EmployeeInput>) => {
  const targetCedula = normalizeCedula(cedula);
  const name = (data.name || "").trim();
  const email = (data.email || "").trim().toLowerCase();
  const position = (data.position || "").trim();

  const result = await pool.query(
    `UPDATE employees
     SET name = $1, email = $2, position = $3
     WHERE cedula = $4
     RETURNING cedula, name, email, position`,
    [name, email, position, targetCedula]
  );

  return result.rows[0] || null;
};

export const remove = async (cedula: string) => {
  await pool.query("DELETE FROM employees WHERE cedula = $1", [
    normalizeCedula(cedula),
  ]);
};
