import { NotFoundError } from "../core/app-error";
import { Attendance, AttendanceRepository } from "../repositories/attendance.repository";
import { EmployeeRepository } from "../repositories/employee.repository";

export class GetAttendanceHistoryUseCase {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceRepository: AttendanceRepository
  ) {}

  async execute(cedula: string): Promise<Attendance[]> {
    const normalizedCedula = cedula.trim().toUpperCase();
    const employee = await this.employeeRepository.findByCedula(normalizedCedula);

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    return this.attendanceRepository.findHistoryByCedula(normalizedCedula);
  }
}
