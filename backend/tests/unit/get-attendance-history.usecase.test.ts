import { NotFoundError } from "../../src/core/app-error";
import { GetAttendanceHistoryUseCase } from "../../src/usecases/GetAttendanceHistoryUseCase";
import { AttendanceRepository } from "../../src/repositories/attendance.repository";
import { EmployeeRepository } from "../../src/repositories/employee.repository";

describe("GetAttendanceHistoryUseCase", () => {
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

  it("returns attendance history when employee exists", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new GetAttendanceHistoryUseCase(employeeRepo, attendanceRepo);

    employeeRepo.findByCedula.mockResolvedValue({
      cedula: "EMP1",
      name: "Test",
      email: "test@test.com",
      position: "QA",
    });

    attendanceRepo.findHistoryByCedula.mockResolvedValue([
      {
        id: 1,
        employee_cedula: "EMP1",
        attendance_date: "2026-02-19",
        check_in_time: new Date("2026-02-19T08:00:00Z").toISOString(),
        check_out_time: new Date("2026-02-19T16:00:00Z").toISOString(),
        total_hours: 8,
      },
    ]);

    const result = await useCase.execute("emp1");

    expect(result).toHaveLength(1);
    expect(attendanceRepo.findHistoryByCedula).toHaveBeenCalledWith("EMP1");
  });

  it("throws 404 when employee does not exist", async () => {
    const employeeRepo = makeEmployeeRepo();
    const attendanceRepo = makeAttendanceRepo();
    const useCase = new GetAttendanceHistoryUseCase(employeeRepo, attendanceRepo);

    employeeRepo.findByCedula.mockResolvedValue(null);

    await expect(useCase.execute("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
