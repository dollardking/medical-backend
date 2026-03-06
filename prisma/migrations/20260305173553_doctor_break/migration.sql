-- CreateTable
CREATE TABLE "DoctorBreak" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "DoctorBreak_pkey" PRIMARY KEY ("id")
);
