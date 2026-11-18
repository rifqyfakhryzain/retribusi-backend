const bcrypt = require("bcrypt");
const prisma = require("../../src/config/prisma.js");

async function seedUsers() {
  console.log(" Membersihkan data user lama...");
  await prisma.user.deleteMany();
  console.log("Menambahkan data user baru dengan Hash...");

  const passwordAdminHash = await bcrypt.hash("admincicalengka", 10);
  const admin = await prisma.user.create({
    data: {
      nama: "Admin Pasar Cicalengka",
      username: "admin_cicalengka",
      password: passwordAdminHash,
      role: "ADMIN",
    },
  });

  const passwordPetugasHash = await bcrypt.hash("petugas123", 10);
  const petugas = await prisma.user.create({
    data: {
      nama: "Petugas Lapangan 1",
      username: "petugas",
      password: passwordPetugasHash,
      role: "PETUGAS",
    },
  });

  return { admin, petugas };
}

module.exports = seedUsers;
