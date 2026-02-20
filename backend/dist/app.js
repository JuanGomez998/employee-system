"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const payroll_routes_1 = __importDefault(require("./routes/payroll.routes"));
const clock_routes_1 = __importDefault(require("./routes/clock.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const auth_1 = require("./middleware/auth");
const error_handler_1 = require("./middleware/error-handler");
const createApp = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use("/api/clock", clock_routes_1.default);
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/employees", auth_1.authMiddleware, auth_1.adminMiddleware, employee_routes_1.default);
    app.use("/api/attendance", auth_1.authMiddleware, auth_1.adminMiddleware, attendance_routes_1.default);
    app.use("/api/payroll", auth_1.authMiddleware, auth_1.adminMiddleware, payroll_routes_1.default);
    app.get("/", (_req, res) => {
        res.send("API is running");
    });
    app.use(error_handler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
