import { Router } from "express";
import { createCabinet } from "../controllers/cabinet.controller";
import { verifyToken } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/", verifyToken, checkRole("ADMIN"), createCabinet);

export default router;