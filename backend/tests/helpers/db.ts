import { readFileSync } from "fs";
import path from "path";
import { pool } from "../../src/db";

const schemaPath = path.resolve(__dirname, "../../../DATABASE_SCHEMA.sql");

export const applySchema = async () => {
  const sql = readFileSync(schemaPath, "utf-8");
  await pool.query(sql);
};

export const resetData = async () => {
  await pool.query("TRUNCATE TABLE attendance, users, employees RESTART IDENTITY CASCADE");
  await pool.query(
    `INSERT INTO users (username, email, password_hash, role, employee_cedula, is_active)
     VALUES ('1001', '1001@test.local', '1001', 'admin', NULL, TRUE)`
  );
};
