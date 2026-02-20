"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceHistory = exports.getAttendanceStatus = exports.checkOut = exports.checkIn = void 0;
const attendance_service_1 = require("../services/attendance.service");
const db_1 = require("../db");
const employee_repository_1 = require("../repositories/employee.repository");
const attendance_repository_1 = require("../repositories/attendance.repository");
const RegisterEntryUseCase_1 = require("../usecases/RegisterEntryUseCase");
const RegisterExitUseCase_1 = require("../usecases/RegisterExitUseCase");
const GetAttendanceHistoryUseCase_1 = require("../usecases/GetAttendanceHistoryUseCase");
const employee_dto_1 = require("../dtos/employee.dto");
const employeeRepository = new employee_repository_1.PgEmployeeRepository(db_1.pool);
const attendanceRepository = new attendance_repository_1.PgAttendanceRepository(db_1.pool);
const registerEntryUseCase = new RegisterEntryUseCase_1.RegisterEntryUseCase(employeeRepository, attendanceRepository);
const registerExitUseCase = new RegisterExitUseCase_1.RegisterExitUseCase(employeeRepository, attendanceRepository);
const getAttendanceHistoryUseCase = new GetAttendanceHistoryUseCase_1.GetAttendanceHistoryUseCase(employeeRepository, attendanceRepository);
const checkIn = async (req, res, next) => {
    try {
        const { cedula } = employee_dto_1.cedulaParamDto.parse(req.params);
        const result = await registerEntryUseCase.execute({ cedula });
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.checkIn = checkIn;
const checkOut = async (req, res, next) => {
    try {
        const { cedula } = employee_dto_1.cedulaParamDto.parse(req.params);
        const result = await registerExitUseCase.execute({ cedula });
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.checkOut = checkOut;
const getAttendanceStatus = async (req, res, next) => {
    try {
        const { cedula } = employee_dto_1.cedulaParamDto.parse(req.params);
        const status = await (0, attendance_service_1.getStatus)(cedula);
        res.json(status);
    }
    catch (error) {
        next(error);
    }
};
exports.getAttendanceStatus = getAttendanceStatus;
const getAttendanceHistory = async (req, res, next) => {
    try {
        const { cedula } = employee_dto_1.cedulaParamDto.parse(req.params);
        const history = await getAttendanceHistoryUseCase.execute(cedula);
        res.json(history);
    }
    catch (error) {
        next(error);
    }
};
exports.getAttendanceHistory = getAttendanceHistory;
