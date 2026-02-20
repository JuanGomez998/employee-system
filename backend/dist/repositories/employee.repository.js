"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgEmployeeRepository = void 0;
class PgEmployeeRepository {
    constructor(pool) {
        this.pool = pool;
    }
    async findAll() {
        const result = await this.pool.query("SELECT cedula, name, email, position FROM employees ORDER BY name ASC");
        return result.rows;
    }
    async findByCedula(cedula) {
        const result = await this.pool.query("SELECT cedula, name, email, position FROM employees WHERE cedula = $1", [cedula]);
        return result.rows[0] ?? null;
    }
    async create(data) {
        const result = await this.pool.query(`INSERT INTO employees (cedula, name, email, position)
       VALUES ($1, $2, $3, $4)
       RETURNING cedula, name, email, position`, [data.cedula, data.name, data.email, data.position]);
        return result.rows[0];
    }
    async update(cedula, data) {
        const result = await this.pool.query(`UPDATE employees
       SET name = $1, email = $2, position = $3
       WHERE cedula = $4
       RETURNING cedula, name, email, position`, [data.name, data.email, data.position, cedula]);
        return result.rows[0] ?? null;
    }
    async delete(cedula) {
        await this.pool.query("DELETE FROM employees WHERE cedula = $1", [cedula]);
    }
}
exports.PgEmployeeRepository = PgEmployeeRepository;
