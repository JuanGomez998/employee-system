"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getAll = void 0;
const db_1 = require("../db");
const normalizeCedula = (cedula) => cedula.trim().toUpperCase();
const getAll = async () => {
    const result = await db_1.pool.query("SELECT cedula, name, email, position FROM employees ORDER BY name ASC");
    return result.rows;
};
exports.getAll = getAll;
const create = async (data) => {
    const cedula = normalizeCedula(data.cedula || "");
    const name = (data.name || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const position = (data.position || "").trim();
    if (!cedula || !name || !email || !position) {
        throw new Error("Missing required fields");
    }
    const duplicateCedula = await db_1.pool.query("SELECT cedula FROM employees WHERE cedula = $1", [cedula]);
    if (duplicateCedula.rows.length > 0) {
        throw new Error("Cedula already exists");
    }
    const result = await db_1.pool.query(`INSERT INTO employees (cedula, name, email, position)
     VALUES ($1, $2, $3, $4)
     RETURNING cedula, name, email, position`, [cedula, name, email, position]);
    return result.rows[0];
};
exports.create = create;
const update = async (cedula, data) => {
    const targetCedula = normalizeCedula(cedula);
    const name = (data.name || "").trim();
    const email = (data.email || "").trim().toLowerCase();
    const position = (data.position || "").trim();
    const result = await db_1.pool.query(`UPDATE employees
     SET name = $1, email = $2, position = $3
     WHERE cedula = $4
     RETURNING cedula, name, email, position`, [name, email, position, targetCedula]);
    return result.rows[0] || null;
};
exports.update = update;
const remove = async (cedula) => {
    await db_1.pool.query("DELETE FROM employees WHERE cedula = $1", [
        normalizeCedula(cedula),
    ]);
};
exports.remove = remove;
