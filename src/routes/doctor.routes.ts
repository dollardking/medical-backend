import { Router } from "express";
import {
  createDoctor,
  addAvailability,
  getDoctors,
  getDoctorById,
  getDoctorAvailabilities,
} from "../controllers/doctor.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

// Public
router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.get("/:id/availability", getDoctorAvailabilities);

// Admin
router.post("/", verifyToken, checkRole("ADMIN"), createDoctor);
router.post(
  "/:doctorId/availability",
  verifyToken,
  checkRole("ADMIN"),
  addAvailability
);

export default router;