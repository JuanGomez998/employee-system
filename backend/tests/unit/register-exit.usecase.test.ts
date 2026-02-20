import { ConflictError, NotFoundError, ValidationError } from "../../src/core/app-error";
import { RegisterExitUseCase } from "../../src/usecases/RegisterExitUseCase";
import { AttendanceRepository } from "../../src/repositories/attendance.repository";
import { EmployeeRepository } from "../../src/repositories/employee.repository";

describe("RegisterExitUseCase", () => {
  const makeEmployeeRepo = (): jest.Mocked<EmployeeRepository> => ({
    findAll: jest.fn(),
    findByCedula: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  const makeAttendanceRepo = (): jest.Mocked<AttendanceRepository> => ({
    findTodayByCedula: jest.fn(),
    createEntry: jest.fn(),
    registerExit: jest.fn(),
    findHistoryByCedula: jest.fn(),
  });

  it("registers check-out when previous check-in exists", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new RegisterExitUseCase(employeeRepo, attendanceRepo);

    const now = new Date("2026-02-19T18:00:00.000Z");
    const checkIn = new Date("2026-02-19T08:00:00.000Z");

    employeeRepo.findByCedula.mockResolvedValue({
      cedula: "EMP1",
      name: "Test",
      email: "test@test.com",
      position: "QA",
    });
    attendanceRepo.findTodayByCedula.mockResolvedValue({
      id: 1,
      employee_cedula: "EMP1",
      attendance_date: "2026-02-19",
      check_in_time: checkIn.toISOString(),
      check_out_time: null,
      total_hours: null,
    });
    attendanceRepo.registerExit.mockResolvedValue({
      id: 1,
      employee_cedula: "EMP1",
      attendance_date: "2026-02-19",
      check_in_time: checkIn.toISOString(),
      check_out_time: now.toISOString(),
      total_hours: 10,
    });

    const result = await useCase.execute({ cedula: "EMP1", now });

    expect(attendanceRepo.registerExit).toHaveBeenCalled();
    expect(result.check_out_time).toBe(now.toISOString());
  });

  it("throws 404 when employee does not exist", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new RegisterExitUseCase(employeeRepo, attendanceRepo);

    employeeRepo.findByCedula.mockResolvedValue(null);

    await expect(useCase.execute({ cedula: "X" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws 400 when no check-in exists", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new RegisterExitUseCase(employeeRepo, attendanceRepo);

    employeeRepo.findByCedula.mockResolvedValue({
      cedula: "EMP1",
      name: "Test",
      email: "test@test.com",
      position: "QA",
    });
    attendanceRepo.findTodayByCedula.mockResolvedValue(null);

    await expect(useCase.execute({ cedula: "EMP1" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws 409 when already checked out", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new RegisterExitUseCase(employeeRepo, attendanceRepo);

    employeeRepo.findByCedula.mockResolvedValue({
      cedula: "EMP1",
      name: "Test",
      email: "test@test.com",
      position: "QA",
    });
    attendanceRepo.findTodayByCedula.mockResolvedValue({
      id: 1,
      employee_cedula: "EMP1",
      attendance_date: "2026-02-19",
      check_in_time: new Date().toISOString(),
      check_out_time: new Date().toISOString(),
      total_hours: 8,
    });

    await expect(useCase.execute({ cedula: "EMP1" })).rejects.toBeInstanceOf(ConflictError);
  });
});
