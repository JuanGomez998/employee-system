import { createEmployeeDto } from "../dtos/employee.dto";
import { ConflictError } from "../core/app-error";
import { Employee, EmployeeRepository } from "../repositories/employee.repository";

export class CreateEmployeeUseCase {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async execute(input: unknown): Promise<Employee> {
    const payload = createEmployeeDto.parse(input);

    const existing = await this.employeeRepository.findByCedula(payload.cedula);
    if (existing) {
      throw new ConflictError("Cedula already exists");
    }

    return this.employeeRepository.create(payload);
  }
}
