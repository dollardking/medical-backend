import prisma from "../config/prisma";
import { createAppointmentSchema } from "../validators/appointment.validator";
import { sendAppointmentConfirmationEmail } from "./email.service";

export const generateSlots = async (doctorId: string, date: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  const dayOfWeek = new Date(date).getDay();

  const availability = await prisma.doctorAvailability.findMany({
    where: {
      doctorId,
      dayOfWeek,
    },
  });

  if (availability.length === 0) {
    return [];
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      date: new Date(date),
      status: {
        not: "CANCELLED",
      },
    },
  });

  const bookedTimes = appointments.map((a) => a.time);
  const duration = doctor.appointmentDuration;

  const slots: string[] = [];

  availability.forEach((slot) => {
    const [startHour, startMinute] = slot.startTime.split(":").map(Number);
    const [endHour, endMinute] = slot.endTime.split(":").map(Number);

    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);

    while (start < end) {
      const hour = start.getHours().toString().padStart(2, "0");
      const minute = start.getMinutes().toString().padStart(2, "0");
      const time = `${hour}:${minute}`;

      if (!bookedTimes.includes(time)) {
        slots.push(time);
      }

      start.setMinutes(start.getMinutes() + duration);
    }
  });

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

  const now = new Date();
  if (appointmentDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
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

    const newAppointment = await tx.appointment.create({
      data: {
        doctorId,
        patientName,
        patientEmail,
        patientPhone,
        date: appointmentDate,
        time,
      },
    });

    return newAppointment;
  });

  await sendAppointmentConfirmationEmail({
    to: patientEmail,
    patientName,
    doctorName: doctor.user.name,
    date,
    time,
    cabinetName: doctor.cabinet.name,
    cabinetAddress: `${doctor.cabinet.address}, ${doctor.cabinet.city}`,
  });

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

  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
  const skip = (safePage - 1) * safeLimit;

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
      take: safeLimit,
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
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

export const confirmAppointment = async (appointmentId: string) => {
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: "CONFIRMED",
    },
  });
};

export const cancelAppointment = async (appointmentId: string) => {
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: "CANCELLED",
    },
  });
};