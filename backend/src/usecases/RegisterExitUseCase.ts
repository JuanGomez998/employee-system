import { attendanceCedulaDto } from "../dtos/attendance.dto";
import { ConflictError, NotFoundError, ValidationError } from "../core/app-error";
import { Attendance, AttendanceRepository } from "../repositories/attendance.repository";
import { EmployeeRepository } from "../repositories/employee.repository";

export class RegisterExitUseCase {
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

    const attendance = await this.attendanceRepository.findTodayByCedula(payload.cedula, today);
    if (!attendance) {
      throw new ValidationError("Employee has not checked in today");
    }

    if (attendance.check_out_time) {
      throw new ConflictError("Employee already checked out today");
    }

    const checkInTime = new Date(attendance.check_in_time);
    const totalHours = Math.max(0, Math.round((((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)) * 100)) / 100);

    return this.attendanceRepository.registerExit(attendance.id, now, totalHours);
  }
}
