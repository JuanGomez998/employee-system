import { Pool } from "pg";

export interface Employee {
  cedula: string;
  name: string;
  email: string;
  position: string;
}

export interface EmployeeRepository {
  findAll(): Promise<Employee[]>;
  findByCedula(cedula: string): Promise<Employee | null>;
  create(data: Employee): Promise<Employee>;
  update(cedula: string, data: Omit<Employee, "cedula">): Promise<Employee | null>;
  delete(cedula: string): Promise<void>;
}

export class PgEmployeeRepository implements EmployeeRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<Employee[]> {
    const result = await this.pool.query(
      "SELECT cedula, name, email, position FROM employees ORDER BY name ASC"
    );
    return result.rows;
  }

  async findByCedula(cedula: string): Promise<Employee | null> {
    const result = await this.pool.query(
      "SELECT cedula, name, email, position FROM employees WHERE cedula = $1",
      [cedula]
    );
    return result.rows[0] ?? null;
  }

  async create(data: Employee): Promise<Employee> {
    const result = await this.pool.query(
      `INSERT INTO employees (cedula, name, email, position)
       VALUES ($1, $2, $3, $4)
       RETURNING cedula, name, email, position`,
      [data.cedula, data.name, data.email, data.position]
    );
    return result.rows[0];
  }

  async update(cedula: string, data: Omit<Employee, "cedula">): Promise<Employee | null> {
    const result = await this.pool.query(
      `UPDATE employees
       SET name = $1, email = $2, position = $3
       WHERE cedula = $4
       RETURNING cedula, name, email, position`,
      [data.name, data.email, data.position, cedula]
    );

    return result.rows[0] ?? null;
  }

  async delete(cedula: string): Promise<void> {
    await this.pool.query("DELETE FROM employees WHERE cedula = $1", [cedula]);
  }
}
