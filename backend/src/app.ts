import express from "express";
import cors from "cors";
import employeeRoutes from "./routes/employee.routes";
import attendanceRoutes from "./routes/attendance.routes";
import payrollRoutes from "./routes/payroll.routes";
import clockRoutes from "./routes/clock.routes";
import authRoutes from "./routes/auth.routes";
import { authMiddleware, adminMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/clock", clockRoutes);
  app.use("/api/auth", authRoutes);

  app.use("/api/employees", authMiddleware, adminMiddleware, employeeRoutes);
  app.use("/api/attendance", authMiddleware, adminMiddleware, attendanceRoutes);
  app.use("/api/payroll", authMiddleware, adminMiddleware, payrollRoutes);

  app.get("/", (_req, res) => {
    res.send("API is running");
  });

  app.use(errorHandler);

  return app;
};
