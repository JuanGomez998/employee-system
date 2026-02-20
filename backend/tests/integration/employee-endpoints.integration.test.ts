import request from "supertest";
import { createApp } from "../../src/app";
import { getAdminAuthHeader } from "../helpers/auth";
import { resetData } from "../helpers/db";

describe("Employee endpoints integration", () => {
  const app = createApp();
  const authHeader = getAdminAuthHeader();

  beforeEach(async () => {
    await resetData();
  });

  it("creates employee successfully", async () => {
    const response = await request(app)
      .post("/api/employees")
      .set(authHeader)
      .send({
        cedula: "E100",
        name: "Empleado Uno",
        email: "empleado1@test.com",
        position: "Dev",
      });

    expect(response.status).toBe(201);
    expect(response.body.cedula).toBe("E100");
  });

  it("returns 409 for duplicate employee", async () => {
    const payload = {
      cedula: "E100",
      name: "Empleado Uno",
      email: "empleado1@test.com",
      position: "Dev",
    };

    await request(app).post("/api/employees").set(authHeader).send(payload);
    const duplicate = await request(app).post("/api/employees").set(authHeader).send(payload);

    expect(duplicate.status).toBe(409);
  });

  it("returns 400 for invalid payload", async () => {
    const response = await request(app)
      .post("/api/employees")
      .set(authHeader)
      .send({ cedula: "", name: "", email: "bad", position: "" });

    expect(response.status).toBe(400);
  });
});
