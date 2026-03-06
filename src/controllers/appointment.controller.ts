import { Request, Response } from "express";
import * as service from "../services/appointment.service";

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const doctorId = req.query.doctorId as string;
    const date = req.query.date as string;

    if (!doctorId || !date) {
      return res.status(400).json({
        message: "doctorId and date are required",
      });
    }

    const slots = await service.generateSlots(doctorId, date);

    res.json(slots);
  } catch (error: any) {
    if (error.message === "DOCTOR_NOT_FOUND") {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await service.createAppointment(req.body);

    res.status(201).json(appointment);
  } catch (error: any) {
    if (typeof error.message === "string" && error.message.startsWith("VALIDATION_ERROR:")) {
      return res.status(400).json({
        message: error.message.replace("VALIDATION_ERROR:", ""),
      });
    }

    if (error.message === "SLOT_ALREADY_BOOKED") {
      return res.status(400).json({
        message: "Slot already booked",
      });
    }

    if (error.message === "DOCTOR_NOT_FOUND") {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    if (error.message === "INVALID_DATE") {
      return res.status(400).json({
        message: "Invalid appointment date",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const result = await service.getDoctorAppointments(userId, page, limit);

    res.json(result);
  } catch (error: any) {
    if (error.message === "DOCTOR_NOT_FOUND") {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const confirmAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id as string;
    const appointment = await service.confirmAppointment(appointmentId);

    res.json(appointment);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.id as string;
    const appointment = await service.cancelAppointment(appointmentId);

    res.json(appointment);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};