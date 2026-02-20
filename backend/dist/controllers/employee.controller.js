"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployees = void 0;
const db_1 = require("../db");
const employee_repository_1 = require("../repositories/employee.repository");
const CreateEmployeeUseCase_1 = require("../usecases/CreateEmployeeUseCase");
const employee_dto_1 = require("../dtos/employee.dto");
const app_error_1 = require("../core/app-error");
const employeeRepository = new employee_repository_1.PgEmployeeRepository(db_1.pool);
const createEmployeeUseCase = new CreateEmployeeUseCase_1.CreateEmployeeUseCase(employeeRepository);
const getEmployees = async (_, res, next) => {
    try {
        const employees = await employeeRepository.findAll();
        res.json(employees);
    }
    catch (error) {
        next(error);
    }
};
exports.getEmployees = getEmployees;
const createEmployee = async (req, res, next) => {
    try {
        const employee = await createEmployeeUseCase.execute(req.body);
        res.status(201).json(employee);
    }
    catch (error) {
        next(error);
    }
};
exports.createEmployee = createEmployee;
const updateEmployee = async (req, res, next) => {
    try {
        const { cedula } = employee_dto_1.cedulaParamDto.parse(req.params);
        const payload = employee_dto_1.updateEmployeeDto.parse(req.body);
        const employee = await employeeRepository.update(cedula, payload);
        if (!employee) {
            throw new app_error_1.NotFoundError("Employee not found");
        }
        res.json(employee);
    }
    catch (error) {
        next(error);
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res, next) => {
    try {
        const { cedula } = employee_dto_1.cedulaParamDto.parse(req.params);
        await employeeRepository.delete(cedula);
        res.json({ message: "Employee deleted" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEmployee = deleteEmployee;
