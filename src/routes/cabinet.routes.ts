import { Router } from "express";
import {
  createCabinet,
  getCabinet,
} from "../controllers/cabinet.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

// Public
router.get("/", getCabinet);

// Admin
router.post("/", verifyToken, checkRole("ADMIN"), createCabinet);

export default router;