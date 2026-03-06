import prisma from "../config/prisma";

export const getAdminStats = async () => {

  const totalDoctors = await prisma.doctor.count();

  const totalAppointments = await prisma.appointment.count();

  const today = new Date();
  today.setHours(0,0,0,0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointmentsToday = await prisma.appointment.count({
    where: {
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  const appointmentsPending = await prisma.appointment.count({
    where: {
      status: "PENDING"
    }
  });

  return {
    totalDoctors,
    totalAppointments,
    appointmentsToday,
    appointmentsPending
  };
};

export const getAllDoctors = async () => {

  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      cabinet: true
    },
    orderBy: {
      user: {
        name: "asc"
      }
    }
  });

  return doctors;
};

export const getAllAppointments = async (
  page: number,
  limit: number
) => {

  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([

    prisma.appointment.findMany({
      include: {
        doctor: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        date: "asc"
      },
      skip,
      take: limit
    }),

    prisma.appointment.count()

  ]);

  return {
    data: appointments,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };

};

export const getAllPatients = async () => {

  const patients = await prisma.appointment.findMany({
    distinct: ["patientEmail"],
    select: {
      patientName: true,
      patientEmail: true,
      patientPhone: true
    }
  });

  return patients;
};

export const getCalendar = async (date: string) => {

  const start = new Date(date);
  start.setHours(0,0,0,0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: start,
        lt: end
      }
    },
    include: {
      doctor: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      time: "asc"
    }
  });

  return appointments;

};