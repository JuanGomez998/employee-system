import { generateToken } from "../../src/utils/jwt";

export const getAdminAuthHeader = () => {
  const token = generateToken({
    id: 1,
    username: "admin",
    email: "admin@test.local",
    role: "admin",
    employee_cedula: "ADMIN",
  });

  return { Authorization: `Bearer ${token}` };
};
