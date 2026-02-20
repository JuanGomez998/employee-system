import { NextFunction, Request, Response } from "express";
import { getStatus } from "../services/attendance.service";
import { pool } from "../db";
import { PgEmployeeRepository } from "../repositories/employee.repository";
import { PgAttendanceRepository } from "../repositories/attendance.repository";
import { RegisterEntryUseCase } from "../usecases/RegisterEntryUseCase";
import { RegisterExitUseCase } from "../usecases/RegisterExitUseCase";
import { GetAttendanceHistoryUseCase } from "../usecases/GetAttendanceHistoryUseCase";
import { cedulaParamDto } from "../dtos/employee.dto";

const employeeRepository = new PgEmployeeRepository(pool);
const attendanceRepository = new PgAttendanceRepository(pool);

const registerEntryUseCase = new RegisterEntryUseCase(
  employeeRepository,
  attendanceRepository
);
const registerExitUseCase = new RegisterExitUseCase(
  employeeRepository,
  attendanceRepository
);
const getAttendanceHistoryUseCase = new GetAttendanceHistoryUseCase(
  employeeRepository,
  attendanceRepository
);

export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cedula } = cedulaParamDto.parse(req.params);
    const result = await registerEntryUseCase.execute({ cedula });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cedula } = cedulaParamDto.parse(req.params);
    const result = await registerExitUseCase.execute({ cedula });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cedula } = cedulaParamDto.parse(req.params);
    const status = await getStatus(cedula);
    res.json(status);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cedula } = cedulaParamDto.parse(req.params);
    const history = await getAttendanceHistoryUseCase.execute(cedula);
    res.json(history);
  } catch (error) {
    next(error);
  }
};