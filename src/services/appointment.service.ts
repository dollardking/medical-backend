import prisma from "../config/prisma";
import { createAppointmentSchema } from "../validators/appointment.validator";
import { sendAppointmentConfirmationEmail } from "./email.service";

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const generateSlots = async (doctorId: string, date: string) => {

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  const appointmentDate = new Date(date);

  if (isNaN(appointmentDate.getTime())) {
    throw new Error("INVALID_DATE");
  }

  const dayOfWeek = appointmentDate.getDay();

  const availability = await prisma.doctorAvailability.findMany({
    where: {
      doctorId,
      dayOfWeek,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (!availability.length) return [];

  const dayStart = new Date(date);
  dayStart.setHours(0,0,0,0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23,59,59,999);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
      status: {
        not: "CANCELLED",
      },
    },
  });

  const bookedTimes = new Set(appointments.map(a => a.time));

  const slots: string[] = [];

  for (const slot of availability) {

    let current = timeToMinutes(slot.startTime);
    const end = timeToMinutes(slot.endTime);

    while (current + doctor.appointmentDuration <= end) {

      const time = minutesToTime(current);

      if (!bookedTimes.has(time)) {
        slots.push(time);
      }

      current += doctor.appointmentDuration;
    }
  }

  return slots;
};

export const createAppointment = async (data: unknown) => {

  const parsed = createAppointmentSchema.safeParse(data);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new Error(`VALIDATION_ERROR:${firstIssue.message}`);
  }

  const {
    doctorId,
    patientName,
    patientEmail,
    patientPhone,
    date,
    time,
  } = parsed.data;

  const appointmentDate = new Date(date);

  if (isNaN(appointmentDate.getTime())) {
    throw new Error("INVALID_DATE");
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  if (appointmentDate < today) {
    throw new Error("INVALID_DATE");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: true,
      cabinet: true,
    },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  const appointment = await prisma.$transaction(async (tx) => {

    const existingAppointment = await tx.appointment.findUnique({
      where: {
        doctorId_date_time: {
          doctorId,
          date: appointmentDate,
          time,
        },
      },
    });

    if (existingAppointment && existingAppointment.status !== "CANCELLED") {
      throw new Error("SLOT_ALREADY_BOOKED");
    }

    return tx.appointment.create({
      data: {
        doctorId,
        patientName,
        patientEmail,
        patientPhone,
        date: appointmentDate,
        time,
        status: "PENDING",
      },
    });

  });

  try {

    await sendAppointmentConfirmationEmail({
      to: patientEmail,
      patientName,
      doctorName: doctor.user.name,
      date,
      time,
      cabinetName: doctor.cabinet.name,
      cabinetAddress: `${doctor.cabinet.address}, ${doctor.cabinet.city}`,
    });

  } catch {
    // On ignore les erreurs d'email
  }

  return appointment;
};

export const getDoctorAppointments = async (
  userId: string,
  page = 1,
  limit = 10
) => {

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
      },
      orderBy: [
        { date: "asc" },
        { time: "asc" },
      ],
      skip,
      take: limit,
    }),
    prisma.appointment.count({
      where: {
        doctorId: doctor.id,
      },
    }),
  ]);

  return {
    data: appointments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const confirmAppointment = async (
  appointmentId: string,
  userId: string
) => {

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
  });

  if (!doctor) throw new Error("DOCTOR_NOT_FOUND");

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) throw new Error("APPOINTMENT_NOT_FOUND");

  if (appointment.doctorId !== doctor.id) {
    throw new Error("FORBIDDEN_APPOINTMENT_ACCESS");
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: "CONFIRMED",
    },
  });
};

export const cancelAppointment = async (
  appointmentId: string,
  userId: string
) => {

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
  });

  if (!doctor) throw new Error("DOCTOR_NOT_FOUND");

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) throw new Error("APPOINTMENT_NOT_FOUND");

  if (appointment.doctorId !== doctor.id) {
    throw new Error("FORBIDDEN_APPOINTMENT_ACCESS");
  }

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: "CANCELLED",
    },
  });
};