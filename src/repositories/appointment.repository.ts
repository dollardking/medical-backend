import prisma from "../config/prisma";

export const findDoctorById = (doctorId: string) => {
  return prisma.doctor.findUnique({
    where: { id: doctorId }
  });
};

export const findDoctorAvailability = (doctorId: string, dayOfWeek: number) => {
  return prisma.doctorAvailability.findMany({
    where: {
      doctorId,
      dayOfWeek
    }
  });
};

export const findAppointments = (doctorId: string, date: Date) => {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      date
    }
  });
};

export const createAppointmentDB = (data: any) => {
  return prisma.appointment.create({
    data
  });
};