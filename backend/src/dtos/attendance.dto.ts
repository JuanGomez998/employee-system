import { z } from "zod";

export const attendanceCedulaDto = z.object({
  cedula: z
    .string()
    .trim()
    .min(1, "Cedula is required")
    .max(20, "Cedula max length is 20")
    .regex(/^\d+$/, "Cedula must contain numbers only"),
});

export type AttendanceCedulaDto = z.infer<typeof attendanceCedulaDto>;
