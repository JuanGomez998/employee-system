import { ConflictError } from "../../src/core/app-error";
import { CreateEmployeeUseCase } from "../../src/usecases/CreateEmployeeUseCase";
import { Employee, EmployeeRepository } from "../../src/repositories/employee.repository";

describe("CreateEmployeeUseCase", () => {
  const makeRepo = (): jest.Mocked<EmployeeRepository> => ({
    findAll: jest.fn(),
    findByCedula: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  it("creates employee when cedula is unique", async () => {
    const repo = makeRepo();
    const useCase = new CreateEmployeeUseCase(repo);

    const payload: Employee = {
      cedula: "ABC123",
      name: "Juan Perez",
      email: "juan@test.com",
      position: "Developer",
    };

    repo.findByCedula.mockResolvedValue(null);
    repo.create.mockResolvedValue(payload);

    const result = await useCase.execute(payload);

    expect(repo.findByCedula).toHaveBeenCalledWith("ABC123");
    expect(repo.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual(payload);
  });

  it("throws conflict when cedula already exists", async () => {
    const repo = makeRepo();
    const useCase = new CreateEmployeeUseCase(repo);

    const payload: Employee = {
      cedula: "ABC123",
      name: "Juan Perez",
      email: "juan@test.com",
      position: "Developer",
    };

    repo.findByCedula.mockResolvedValue(payload);

    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("throws validation error for invalid payload", async () => {
    const repo = makeRepo();
    const useCase = new CreateEmployeeUseCase(repo);

    await expect(
      useCase.execute({ cedula: "", name: "", email: "bad", position: "" })
    ).rejects.toBeTruthy();
  });
});
