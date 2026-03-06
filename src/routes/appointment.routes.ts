import { Router } from "express";
import {
  getAvailableSlots,
  createAppointment,
  getDoctorAppointments,
  confirmAppointment,
  cancelAppointment
} from "../controllers/appointment.controller";

import { verifyToken } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/available-slots", getAvailableSlots);
router.post("/", createAppointment);

router.get(
  "/doctor",
  verifyToken,
  checkRole("DOCTOR"),
  getDoctorAppointments
);

router.patch(
  "/:id/confirm",
  verifyToken,
  checkRole("DOCTOR"),
  confirmAppointment
);

router.patch(
  "/:id/cancel",
  verifyToken,
  checkRole("DOCTOR"),
  cancelAppointment
);

export default router;