import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seeding data bangunan
  const building1 = await prisma.buildings.create({
    data: {
      desc: 'Gedung A',
      foto1: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_a1.jpg',
      foto2: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_a2.jpg',
      foto3: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_a3.jpg',
      foto4: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_a4.jpg',
      foto5: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_a5.jpg',
      published: true,
    },
  });

  const building2 = await prisma.buildings.create({
    data: {
      desc: 'Gedung B',
      foto1: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_b1.jpg',
      foto2: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_b2.jpg',
      foto3: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_b3.jpg',
      foto4: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_b4.jpg',
      foto5: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/gedung_b5.jpg',
      published: false,
    },
  });

  console.log({ building1, building2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
