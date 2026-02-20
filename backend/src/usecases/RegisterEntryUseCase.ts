import { attendanceCedulaDto } from "../dtos/attendance.dto";
import { ConflictError, NotFoundError } from "../core/app-error";
import { Attendance, AttendanceRepository } from "../repositories/attendance.repository";
import { EmployeeRepository } from "../repositories/employee.repository";

export class RegisterEntryUseCase {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly attendanceRepository: AttendanceRepository
  ) {}

  async execute(input: { cedula: string; now?: Date }): Promise<Attendance> {
    const payload = attendanceCedulaDto.parse({ cedula: input.cedula });
    const now = input.now ?? new Date();
    const today = now.toISOString().split("T")[0];

    const employee = await this.employeeRepository.findByCedula(payload.cedula);
    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    const existing = await this.attendanceRepository.findTodayByCedula(payload.cedula, today);
    if (existing) {
      throw new ConflictError("Employee already checked in today");
    }

    return this.attendanceRepository.createEntry(payload.cedula, today, now);
  }
}
