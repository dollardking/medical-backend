import { Request, Response } from "express";
import prisma from "../config/prisma";

export const createCabinet = async (req: Request, res: Response) => {
  try {
    const { name, address, city, phone, email, googleMapsUrl } = req.body;

    const existingCabinet = await prisma.cabinet.findFirst();

    if (existingCabinet) {
      return res.status(400).json({
        message: "Cabinet already exists"
      });
    }

    const cabinet = await prisma.cabinet.create({
      data: {
        name,
        address,
        city,
        phone,
        email,
        googleMapsUrl
      }
    });

    res.status(201).json(cabinet);

  } catch (error) {
    res.status(500).json({
      message: "Server error"
    });
  }
};