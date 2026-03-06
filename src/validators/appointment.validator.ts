import { z } from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.string().uuid("doctorId invalide"),
  patientName: z.string().min(2, "Nom trop court"),
  patientEmail: z.string().email("Email invalide"),
  patientPhone: z.string().min(6, "Téléphone invalide"),
  date: z.string().min(1, "Date requise"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide, format HH:mm"),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;