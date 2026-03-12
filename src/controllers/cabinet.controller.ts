import { Request, Response } from "express";
import prisma from "../config/prisma";

export const createCabinet = async (req: Request, res: Response) => {
  try {
    const { name, address, city, phone, email, googleMapsUrl } = req.body;

    if (!name || !address || !city || !phone || !email) {
      return res.status(400).json({
        message: "name, address, city, phone and email are required",
      });
    }

    const existingCabinet = await prisma.cabinet.findFirst();

    if (existingCabinet) {
      return res.status(400).json({
        message: "Cabinet already exists",
      });
    }

    const cabinet = await prisma.cabinet.create({
      data: {
        name,
        address,
        city,
        phone,
        email,
        googleMapsUrl: googleMapsUrl || null,
      },
    });

    return res.status(201).json(cabinet);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getCabinet = async (_req: Request, res: Response) => {
  try {
    const cabinet = await prisma.cabinet.findFirst();

    if (!cabinet) {
      return res.status(404).json({
        message: "Cabinet not found",
      });
    }

    return res.json(cabinet);
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};