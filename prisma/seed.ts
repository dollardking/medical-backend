import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("@dmin1234", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "emmastareme130504@gmail.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("Admin créé :", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });