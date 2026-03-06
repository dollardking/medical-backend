import cron from "node-cron";
import prisma from "../config/prisma";

cron.schedule("0 * * * *", async () => {

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: tomorrow
    }
  });

  appointments.forEach(a => {
    console.log("Reminder for", a.patientEmail);
  });

});