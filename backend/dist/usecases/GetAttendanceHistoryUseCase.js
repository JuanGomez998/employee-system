"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAttendanceHistoryUseCase = void 0;
const app_error_1 = require("../core/app-error");
class GetAttendanceHistoryUseCase {
    constructor(employeeRepository, attendanceRepository) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
    }
    async execute(cedula) {
        const normalizedCedula = cedula.trim().toUpperCase();
        const employee = await this.employeeRepository.findByCedula(normalizedCedula);
        if (!employee) {
            throw new app_error_1.NotFoundError("Employee not found");
        }
        return this.attendanceRepository.findHistoryByCedula(normalizedCedula);
    }
}
exports.GetAttendanceHistoryUseCase = GetAttendanceHistoryUseCase;
