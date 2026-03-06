import { Router } from "express";
import prisma from "../config/prisma";
import { verifyToken } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

router.get(
  "/users",
  verifyToken,
  checkRole("ADMIN"),
  async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
  }
);

export default router;