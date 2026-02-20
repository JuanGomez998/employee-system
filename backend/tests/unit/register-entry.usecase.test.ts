import { ConflictError, NotFoundError } from "../../src/core/app-error";
import { RegisterEntryUseCase } from "../../src/usecases/RegisterEntryUseCase";
import { AttendanceRepository } from "../../src/repositories/attendance.repository";
import { EmployeeRepository } from "../../src/repositories/employee.repository";

describe("RegisterEntryUseCase", () => {
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

  it("registers check-in when employee exists and no entry today", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new RegisterEntryUseCase(employeeRepo, attendanceRepo);

    const now = new Date("2026-02-19T08:00:00.000Z");

    employeeRepo.findByCedula.mockResolvedValue({
      cedula: "EMP1",
      name: "Test",
      email: "test@test.com",
      position: "QA",
    });
    attendanceRepo.findTodayByCedula.mockResolvedValue(null);
    attendanceRepo.createEntry.mockResolvedValue({
      id: 1,
      employee_cedula: "EMP1",
      attendance_date: "2026-02-19",
      check_in_time: now.toISOString(),
      check_out_time: null,
      total_hours: null,
    });

    const result = await useCase.execute({ cedula: "emp1", now });

    expect(attendanceRepo.createEntry).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it("throws not found if employee does not exist", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new RegisterEntryUseCase(employeeRepo, attendanceRepo);

    employeeRepo.findByCedula.mockResolvedValue(null);

    await expect(useCase.execute({ cedula: "EMP404" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws conflict if already checked in", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new RegisterEntryUseCase(employeeRepo, attendanceRepo);

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
      check_out_time: null,
      total_hours: null,
    });

    await expect(useCase.execute({ cedula: "EMP1" })).rejects.toBeInstanceOf(ConflictError);
  });
});
