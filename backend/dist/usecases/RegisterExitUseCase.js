"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterExitUseCase = void 0;
const attendance_dto_1 = require("../dtos/attendance.dto");
const app_error_1 = require("../core/app-error");
class RegisterExitUseCase {
    constructor(employeeRepository, attendanceRepository) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
    }
    async execute(input) {
        const payload = attendance_dto_1.attendanceCedulaDto.parse({ cedula: input.cedula });
        const now = input.now ?? new Date();
        const today = now.toISOString().split("T")[0];
        const employee = await this.employeeRepository.findByCedula(payload.cedula);
        if (!employee) {
            throw new app_error_1.NotFoundError("Employee not found");
        }
        const attendance = await this.attendanceRepository.findTodayByCedula(payload.cedula, today);
        if (!attendance) {
            throw new app_error_1.ValidationError("Employee has not checked in today");
        }
        if (attendance.check_out_time) {
            throw new app_error_1.ConflictError("Employee already checked out today");
        }
        const checkInTime = new Date(attendance.check_in_time);
        const totalHours = Math.max(0, Math.round((((now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)) * 100)) / 100);
        return this.attendanceRepository.registerExit(attendance.id, now, totalHours);
    }
}
exports.RegisterExitUseCase = RegisterExitUseCase;
