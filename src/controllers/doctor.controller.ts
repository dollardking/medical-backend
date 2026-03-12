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
      appointmentDuration,
    } = req.body;

    if (!name || !email || !password || !specialty || !appointmentDuration) {
      return res.status(400).json({
        message:
          "name, email, password, specialty and appointmentDuration are required",
      });
    }

    const cabinet = await prisma.cabinet.findFirst();

    if (!cabinet) {
      return res.status(400).json({
        message: "Cabinet not found",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "DOCTOR",
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          cabinetId: cabinet.id,
          specialty,
          description: description || null,
          appointmentDuration: Number(appointmentDuration),
        },
      });

      return { user, doctor };
    });

    return res.status(201).json({
      message: "Doctor created successfully",
      data: {
        doctor: result.doctor,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const addAvailability = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.doctorId as string;
    const { dayOfWeek, startTime, endTime } = req.body;

    if (
      dayOfWeek === undefined ||
      dayOfWeek === null ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        message: "dayOfWeek, startTime and endTime are required",
      });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
      },
    });

    return res.status(201).json({
      message: "Availability added successfully",
      data: availability,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getDoctors = async (_req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cabinet: {
          select: {
            id: true,
            name: true,
            city: true,
            phone: true,
            email: true,
            address: true,
            googleMapsUrl: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor.id,
      specialty: doctor.specialty,
      description: doctor.description,
      appointmentDuration: doctor.appointmentDuration,
      user: doctor.user,
      cabinet: doctor.cabinet,
    }));

    return res.json(formattedDoctors);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id as string;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cabinet: {
          select: {
            id: true,
            name: true,
            city: true,
            phone: true,
            email: true,
            address: true,
            googleMapsUrl: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    return res.json({
      id: doctor.id,
      specialty: doctor.specialty,
      description: doctor.description,
      appointmentDuration: doctor.appointmentDuration,
      user: doctor.user,
      cabinet: doctor.cabinet,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getDoctorAvailabilities = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id as string;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const availabilities = await prisma.doctorAvailability.findMany({
      where: { doctorId },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return res.json(availabilities);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};