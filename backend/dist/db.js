"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const database = process.env.DB_NAME ||
    (process.env.NODE_ENV === "test" ? "employee_system_test" : "employee_system");
exports.pool = new pg_1.Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database,
    password: process.env.DB_PASSWORD || "1234",
    port: Number(process.env.DB_PORT || 5432),
});
