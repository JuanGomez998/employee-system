import request from "supertest";
import { createApp } from "../../src/app";
import { getAdminAuthHeader } from "../helpers/auth";
import { resetData } from "../helpers/db";

const app = createApp();
const authHeader = getAdminAuthHeader();

async function createEmployee(cedula: string) {
  await request(app)
    .post("/api/employees")
    .set(authHeader)
    .send({
      cedula,
      name: `Emp ${cedula}`,
      email: `${cedula.toLowerCase()}@test.com`,
      position: "Ops",
    });
}

describe("Attendance endpoints integration", () => {
  beforeEach(async () => {
    await resetData();
  });

  it("registers check-in", async () => {
    await createEmployee("E200");

    const response = await request(app)
      .post("/api/attendance/check-in/E200")
      .set(authHeader);

    expect(response.status).toBe(201);
    expect(response.body.employee_cedula).toBe("E200");
  });

  it("prevents two consecutive check-ins", async () => {
    await createEmployee("E201");
    await request(app).post("/api/attendance/check-in/E201").set(authHeader);

    const second = await request(app)
      .post("/api/attendance/check-in/E201")
      .set(authHeader);

    expect(second.status).toBe(409);
  });

  it("prevents check-out without prior check-in", async () => {
    await createEmployee("E202");

    const response = await request(app)
      .post("/api/attendance/check-out/E202")
      .set(authHeader);

    expect(response.status).toBe(400);
  });

  it("registers check-out after check-in", async () => {
    await createEmployee("E203");
    await request(app).post("/api/attendance/check-in/E203").set(authHeader);

    const response = await request(app)
      .post("/api/attendance/check-out/E203")
      .set(authHeader);

    expect(response.status).toBe(200);
    expect(response.body.check_out_time).toBeTruthy();
  });
});
