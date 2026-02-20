import request from "supertest";
import { createApp } from "../../src/app";
import { getAdminAuthHeader } from "../helpers/auth";
import { resetData } from "../helpers/db";

describe("E2E attendance flow", () => {
  const app = createApp();
  const authHeader = getAdminAuthHeader();

  beforeEach(async () => {
    await resetData();
  });

  it("creates employee, checks in, checks out and fetches history", async () => {
    const cedula = "E2E100";

    const createEmployee = await request(app)
      .post("/api/employees")
      .set(authHeader)
      .send({
        cedula,
        name: "Empleado E2E",
        email: "e2e100@test.com",
        position: "SRE",
      });

    expect(createEmployee.status).toBe(201);

    const checkIn = await request(app)
      .post(`/api/attendance/check-in/${cedula}`)
      .set(authHeader);

    expect(checkIn.status).toBe(201);

    const checkOut = await request(app)
      .post(`/api/attendance/check-out/${cedula}`)
      .set(authHeader);

    expect(checkOut.status).toBe(200);

    const history = await request(app)
      .get(`/api/attendance/history/${cedula}`)
      .set(authHeader);

    expect(history.status).toBe(200);
    expect(Array.isArray(history.body)).toBe(true);
    expect(history.body.length).toBeGreaterThan(0);
    expect(history.body[0].employee_cedula).toBe(cedula);
  });
});
