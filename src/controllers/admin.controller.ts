import { Request, Response } from "express";
import * as adminService from "../services/admin.service";

export const getAdminStats = async (req: Request, res: Response) => {

  try {

    const stats = await adminService.getAdminStats();

    res.json(stats);

  } catch {

    res.status(500).json({
      message: "Server error"
    });
  }

};

export const getAllDoctors = async (req: Request, res: Response) => {

  try {

    const doctors = await adminService.getAllDoctors();

    res.json(doctors);

  } catch {

    res.status(500).json({
      message: "Server error"
    });
  }

};

export const getAllAppointments = async (req: Request, res: Response) => {

  try {

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const result = await adminService.getAllAppointments(
      page,
      limit
    );

    res.json(result);

  } catch {

    res.status(500).json({
      message: "Server error"
    });
  }

};

export const getAllPatients = async (req: Request, res: Response) => {

  try {

    const patients = await adminService.getAllPatients();

    res.json(patients);

  } catch {

    res.status(500).json({
      message: "Server error"
    });
  }

};

export const getCalendar = async (req: Request, res: Response) => {

  try {

    const date = req.query.date as string;

    const data = await adminService.getCalendar(date);

    res.json(data);

  } catch {

    res.status(500).json({
      message: "Server error"
    });
  }

};