"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cedulaParamDto = exports.updateEmployeeDto = exports.createEmployeeDto = void 0;
const zod_1 = require("zod");
const lettersRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const normalizedCedula = zod_1.z
    .string()
    .trim()
    .min(1, "Cedula is required")
    .max(20, "Cedula max length is 20")
    .regex(/^\d+$/, "Cedula must contain numbers only");
const normalizedName = zod_1.z
    .string()
    .trim()
    .min(2, "Name is required")
    .regex(lettersRegex, "Name must contain letters only")
    .transform((value) => value.replace(/\s+/g, " "));
const normalizedPosition = zod_1.z
    .string()
    .trim()
    .min(2, "Position is required")
    .regex(lettersRegex, "Position must contain letters only")
    .transform((value) => value.replace(/\s+/g, " "));
const normalizedEmail = zod_1.z
    .string()
    .trim()
    .email("Invalid email format")
    .transform((value) => value.toLowerCase());
exports.createEmployeeDto = zod_1.z.object({
    cedula: normalizedCedula,
    name: normalizedName,
    email: normalizedEmail,
    position: normalizedPosition,
});
exports.updateEmployeeDto = zod_1.z.object({
    name: normalizedName,
    email: normalizedEmail,
    position: normalizedPosition,
});
exports.cedulaParamDto = zod_1.z.object({
    cedula: normalizedCedula,
});
