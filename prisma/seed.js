const prisma = require("../src/config/prisma.js");

const seedUsers = require("./seeds/user.seed.js");

async function main() {
  console.log("Menjalankan seeder database");

  await seedUsers();

  console.log("semua seeder selesai");
}
main()
  .catch((e) => {
    console.error("Gagal menambahkan seeder", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
