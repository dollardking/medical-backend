import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

type ConfirmationEmailParams = {
  to: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  cabinetName?: string;
  cabinetAddress?: string;
};

export const sendAppointmentConfirmationEmail = async ({
  to,
  patientName,
  doctorName,
  date,
  time,
  cabinetName,
  cabinetAddress,
}: ConfirmationEmailParams) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Confirmation de rendez-vous",
    html: `
      <h2>Confirmation de rendez-vous</h2>
      <p>Bonjour ${patientName},</p>
      <p>Votre rendez-vous a bien été enregistré.</p>
      <ul>
        <li><strong>Médecin :</strong> ${doctorName}</li>
        <li><strong>Date :</strong> ${date}</li>
        <li><strong>Heure :</strong> ${time}</li>
        ${cabinetName ? `<li><strong>Cabinet :</strong> ${cabinetName}</li>` : ""}
        ${cabinetAddress ? `<li><strong>Adresse :</strong> ${cabinetAddress}</li>` : ""}
      </ul>
      <p>Merci.</p>
    `,
  });
};