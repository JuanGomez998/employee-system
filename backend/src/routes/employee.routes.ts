import { Router } from "express";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller";

const router = Router();

router.get("/", getEmployees);
router.post("/", createEmployee);
router.put("/:cedula", updateEmployee);
router.delete("/:cedula", deleteEmployee);

export default router;