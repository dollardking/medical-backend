import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      specialty,
      description,
      appointmentDuration
    } = req.body;

    const cabinet = await prisma.cabinet.findFirst();

    if (!cabinet) {
      return res.status(400).json({
        message: "Cabinet not found"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "DOCTOR"
        }
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          cabinetId: cabinet.id,
          specialty,
          description,
          appointmentDuration
        }
      });

      return { user, doctor };
    });

    res.status(201).json(result);

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};

export const addAvailability = async (req: Request, res: Response) => {
  try {

    const doctorId = req.params.doctorId as string;

    const { dayOfWeek, startTime, endTime } = req.body;

    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId,
        dayOfWeek,
        startTime,
        endTime
      }
    });

    res.status(201).json(availability);

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};