import { Router } from "express";
import { createDoctor } from "../controllers/doctor.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";
import { addAvailability } from "../controllers/doctor.controller";

const router = Router();

router.post("/:doctorId/availability", verifyToken, checkRole("ADMIN"), createDoctor, addAvailability);

export default router;