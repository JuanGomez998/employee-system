import { Router } from "express";
import { checkIn, checkOut, getAttendanceStatus, getAttendanceHistory } 
from "../controllers/attendance.controller";

const router = Router();

router.post("/check-in/:cedula", checkIn);
router.post("/check-out/:cedula", checkOut);
router.get("/status/:cedula", getAttendanceStatus);
router.get("/history/:cedula", getAttendanceHistory);

export default router;