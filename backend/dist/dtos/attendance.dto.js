"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceCedulaDto = void 0;
const zod_1 = require("zod");
exports.attendanceCedulaDto = zod_1.z.object({
    cedula: zod_1.z
        .string()
        .trim()
        .min(1, "Cedula is required")
        .max(20, "Cedula max length is 20")
        .regex(/^\d+$/, "Cedula must contain numbers only"),
});
