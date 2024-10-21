-- CreateTable
CREATE TABLE "Buildings" (
    "id" SERIAL NOT NULL,
    "foto1" TEXT NOT NULL,
    "foto2" TEXT NOT NULL,
    "foto3" TEXT NOT NULL,
    "foto4" TEXT NOT NULL,
    "foto5" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buildings_pkey" PRIMARY KEY ("id")
);
