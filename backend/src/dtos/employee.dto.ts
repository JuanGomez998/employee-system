import { z } from "zod";

const lettersRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;

const normalizedCedula = z
  .string()
  .trim()
  .min(1, "Cedula is required")
  .max(20, "Cedula max length is 20")
  .regex(/^\d+$/, "Cedula must contain numbers only");

const normalizedName = z
  .string()
  .trim()
  .min(2, "Name is required")
  .regex(lettersRegex, "Name must contain letters only")
  .transform((value) => value.replace(/\s+/g, " "));

const normalizedPosition = z
  .string()
  .trim()
  .min(2, "Position is required")
  .regex(lettersRegex, "Position must contain letters only")
  .transform((value) => value.replace(/\s+/g, " "));

const normalizedEmail = z
  .string()
  .trim()
  .email("Invalid email format")
  .transform((value) => value.toLowerCase());

export const createEmployeeDto = z.object({
  cedula: normalizedCedula,
  name: normalizedName,
  email: normalizedEmail,
  position: normalizedPosition,
});

export const updateEmployeeDto = z.object({
  name: normalizedName,
  email: normalizedEmail,
  position: normalizedPosition,
});

export const cedulaParamDto = z.object({
  cedula: normalizedCedula,
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeDto>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeDto>;
