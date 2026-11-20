const prisma = require("../src/config/prisma.js");

const seedUsers = require("./seeds/user.seed.js");
const seedKios = require("./seeds/kios.seed.js");

async function main() {
  console.log("=== Menjalankan Seeder Database e-Retribusi ===");

  await seedUsers();
  await seedKios();

  console.log("=== Semua Seeder Berhasil Dijalankan! ===");
}

main()
  .catch((e) => {
    console.error("Gagal menambahkan seeder", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
