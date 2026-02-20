import { NextFunction, Request, Response } from "express";
import { pool } from "../db";
import {
  PgEmployeeRepository,
} from "../repositories/employee.repository";
import { CreateEmployeeUseCase } from "../usecases/CreateEmployeeUseCase";
import { cedulaParamDto, updateEmployeeDto } from "../dtos/employee.dto";
import { NotFoundError } from "../core/app-error";

const employeeRepository = new PgEmployeeRepository(pool);
const createEmployeeUseCase = new CreateEmployeeUseCase(employeeRepository);

export const getEmployees = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await employeeRepository.findAll();
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await createEmployeeUseCase.execute(req.body);
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cedula } = cedulaParamDto.parse(req.params);
    const payload = updateEmployeeDto.parse(req.body);
    const employee = await employeeRepository.update(cedula, payload);

    if (!employee) {
      throw new NotFoundError("Employee not found");
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cedula } = cedulaParamDto.parse(req.params);
    await employeeRepository.delete(cedula);
    res.json({ message: "Employee deleted" });
  } catch (error) {
    next(error);
  }
};