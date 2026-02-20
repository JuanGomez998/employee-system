"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterEntryUseCase = void 0;
const attendance_dto_1 = require("../dtos/attendance.dto");
const app_error_1 = require("../core/app-error");
class RegisterEntryUseCase {
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
        const existing = await this.attendanceRepository.findTodayByCedula(payload.cedula, today);
        if (existing) {
            throw new app_error_1.ConflictError("Employee already checked in today");
        }
        return this.attendanceRepository.createEntry(payload.cedula, today, now);
    }
}
exports.RegisterEntryUseCase = RegisterEntryUseCase;
