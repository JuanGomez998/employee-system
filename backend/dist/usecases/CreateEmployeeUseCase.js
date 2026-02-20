"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEmployeeUseCase = void 0;
const employee_dto_1 = require("../dtos/employee.dto");
const app_error_1 = require("../core/app-error");
class CreateEmployeeUseCase {
    constructor(employeeRepository) {
        this.employeeRepository = employeeRepository;
    }
    async execute(input) {
        const payload = employee_dto_1.createEmployeeDto.parse(input);
        const existing = await this.employeeRepository.findByCedula(payload.cedula);
        if (existing) {
            throw new app_error_1.ConflictError("Cedula already exists");
        }
        return this.employeeRepository.create(payload);
    }
}
exports.CreateEmployeeUseCase = CreateEmployeeUseCase;
