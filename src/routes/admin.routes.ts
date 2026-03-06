import { Router } from "express";
import { getAdminStats, 
         getAllDoctors, 
         getAllAppointments, 
         getAllPatients,
         getCalendar } from "../controllers/admin.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/stats",
  verifyToken,
  checkRole("ADMIN"),
  getAdminStats
);

router.get(
  "/doctors",
  verifyToken,
  checkRole("ADMIN"),
  getAllDoctors
);

router.get(
  "/appointments",
  verifyToken,
  checkRole("ADMIN"),
  getAllAppointments
);

router.get(
  "/patients",
  verifyToken,
  checkRole("ADMIN"),
  getAllPatients
);

router.get(
  "/calendar",
  verifyToken,
  checkRole("ADMIN"),
  getCalendar
);

export default router;