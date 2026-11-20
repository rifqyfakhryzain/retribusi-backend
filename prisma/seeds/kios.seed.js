const prisma = require("../../src/config/prisma.js");
const {
  formatPayload,
  generateSignature,
  createQrToken,
} = require("../../src/modules/qrcode/qrcode.service.js");

async function seedKios() {
  console.log(" Membersihkan data kios lama...");
  await prisma.kios.deleteMany();
  console.log(" Menambahkan data kios pedagang Pasar Cicalengka dengan Token Kriptografi HMAC...");

  const dataKios = [
    {
      kode_kios: "K-BSM-01",
      nama_pemilik: "Ibu Hj. Siti",
      jenis_dagangan: "Daging Ayam & Bebek",
      lantai: "BASEMENT",
      tarif_retribusi: 10000,
    },
    {
      kode_kios: "K-BSM-02",
      nama_pemilik: "Pak Cecep",
      jenis_dagangan: "Ikan Basah & Hasil Laut",
      lantai: "BASEMENT",
      tarif_retribusi: 10000,
    },
    {
      kode_kios: "K-LT1-01",
      nama_pemilik: "Bapak Suhendar",
      jenis_dagangan: "Sayur Mayur & Bumbu Dapur",
      lantai: "LANTAI_1",
      tarif_retribusi: 5000,
    },
    {
      kode_kios: "K-LT1-02",
      nama_pemilik: "Ibu Lilis",
      jenis_dagangan: "Buah-buahan Segar",
      lantai: "LANTAI_1",
      tarif_retribusi: 5000,
    },
    {
      kode_kios: "K-LT2-01",
      nama_pemilik: "H. Ahmad Fauzi",
      jenis_dagangan: "Pakaian & Busana Muslim",
      lantai: "LANTAI_2",
      tarif_retribusi: 7000,
    },
  ];

  const createdKios = [];
  for (const item of dataKios) {
    const payload = formatPayload(item.kode_kios, item.lantai, item.tarif_retribusi);
    const signature = generateSignature(payload);
    const qrToken = createQrToken(payload, signature);

    const kios = await prisma.kios.create({
      data: {
        ...item,
        qr_token: qrToken,
      },
    });
    createdKios.push(kios);
  }

  console.log(` Berhasil menambahkan ${createdKios.length} kios terenkripsi!`);
  return createdKios;
}

module.exports = seedKios;
