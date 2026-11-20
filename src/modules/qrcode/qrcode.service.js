const crypto = require("crypto");
const QRCode = require("qrcode");
const prisma = require("../../config/prisma.js");

const getSecretKey = () => {
  const secret = process.env.QR_SECRET_KEY;
  if (!secret) {
    throw new Error(
      "QR_SECRET_KEY belum dikonfigurasi di file environment (.env)",
    );
  }
  return secret;
};

/**
 * Format string identitas payload stiker lapak kios
 * Contoh: "kode_kios:K-BSM-01|lantai:BASEMENT|tarif:5000"
 */
const formatPayload = (kode_kios, lantai, tarif_retribusi) => {
  return `kode_kios:${kode_kios}|lantai:${lantai}|tarif:${tarif_retribusi}`;
};

/**
 * Buat Tanda Tangan Digital Kriptografi HMAC-SHA256
 */
const generateSignature = (payload) => {
  const secretKey = getSecretKey();
  return crypto.createHmac("sha256", secretKey).update(payload).digest("hex");
};

/**
 * Bungkus payload & signature menjadi token Base64
 */
const createQrToken = (payload, signature) => {
  const tokenObj = {
    data: payload,
    sig: signature,
  };
  return Buffer.from(JSON.stringify(tokenObj), "utf-8").toString("base64");
};

/**
 * Render token Base64 menjadi Data URL Gambar QR Code (PNG)
 */
const renderQrImage = async (qrToken) => {
  return await QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: "M",
    margin: 2,
    scale: 8,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
};

/**
 * Logika Penerbitan QR Code Baru (Khusus Admin UPTD)
 */
const generateKiosQr = async ({
  kode_kios,
  nama_pemilik,
  jenis_dagangan,
  lantai,
  tarif_retribusi = 5000,
}) => {
  const normalizedKode = kode_kios.trim().toUpperCase();

  // Periksa apakah kode kios sudah terdaftar
  const existingKios = await prisma.kios.findUnique({
    where: { kode_kios: normalizedKode },
  });

  if (existingKios) {
    throw new Error(
      `Kode kios '${normalizedKode}' sudah terdaftar dalam sistem`,
    );
  }

  // Susun string payload
  const payload = formatPayload(normalizedKode, lantai, tarif_retribusi);

  // Tandatangani payload secara kriptografis (HMAC-SHA256)
  const signature = generateSignature(payload);

  // Konversi menjadi string Base64 aman
  const qrToken = createQrToken(payload, signature);

  // Render ke gambar Data URL Base64
  const qrImageUrl = await renderQrImage(qrToken);

  // Simpan ke database Neon PostgreSQL
  const newKios = await prisma.kios.create({
    data: {
      kode_kios: normalizedKode,
      nama_pemilik,
      jenis_dagangan,
      lantai,
      tarif_retribusi: Number(tarif_retribusi),
      qr_token: qrToken,
    },
  });

  return {
    ...newKios,
    qr_image_url: qrImageUrl,
  };
};

/**
 * Logika Verifikasi Keaslian QR Code (Dipanggil oleh Petugas / Kamera Scanner)
 */
const verifyKiosQr = async (qrToken) => {
  let decoded;
  try {
    const jsonStr = Buffer.from(qrToken, "base64").toString("utf-8");
    decoded = JSON.parse(jsonStr);
  } catch (error) {
    throw new Error(
      "Peringatan Fraud: Format token QR Code rusak atau tidak valid!",
    );
  }

  if (
    !decoded ||
    typeof decoded.data !== "string" ||
    typeof decoded.sig !== "string"
  ) {
    throw new Error("Peringatan Fraud: Struktur payload QR Code tidak sah!");
  }

  // Hitung ulang tanda tangan digital dari payload yang diterima
  const expectedSig = generateSignature(decoded.data);

  // Verifikasi kesamaan signature secara timing-safe untuk mencegah timing attacks
  const receivedSigBuffer = Buffer.from(decoded.sig, "hex");
  const expectedSigBuffer = Buffer.from(expectedSig, "hex");

  if (
    receivedSigBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(receivedSigBuffer, expectedSigBuffer)
  ) {
    throw new Error(
      "Peringatan Fraud: QR Code Palsu / Terindikasi Manipulasi!",
    );
  }

  // Ekstrak data lapak dari payload teks
  const parts = Object.fromEntries(
    decoded.data.split("|").map((item) => {
      const [key, ...vals] = item.split(":");
      return [key, vals.join(":")];
    }),
  );

  if (!parts.kode_kios) {
    throw new Error(
      "Peringatan Fraud: Identitas kode kios tidak ditemukan dalam token QR!",
    );
  }

  // Cocokkan dengan data resmi di database
  const kios = await prisma.kios.findUnique({
    where: { kode_kios: parts.kode_kios },
  });

  if (!kios) {
    throw new Error(
      `Kios dengan kode '${parts.kode_kios}' tidak ditemukan di database resmi pasar`,
    );
  }

  // Pastikan token yang dipindai adalah token aktif resmi terdaftar
  if (kios.qr_token && kios.qr_token !== qrToken) {
    throw new Error(
      "Peringatan Fraud: QR Code ini sudah tidak berlaku atau telah diperbarui oleh Admin!",
    );
  }

  return {
    id: kios.id,
    kode_kios: kios.kode_kios,
    nama_pemilik: kios.nama_pemilik,
    jenis_dagangan: kios.jenis_dagangan,
    lantai: kios.lantai,
    tarif: kios.tarif_retribusi,
    is_basement: kios.lantai === "BASEMENT",
  };
};

/**
 * Mengambil seluruh data kios beserta render gambar QR-nya
 */
const listAllKios = async () => {
  const kiosList = await prisma.kios.findMany({
    orderBy: { kode_kios: "asc" },
  });

  // Render QR image untuk setiap kios
  const kiosWithQrImages = await Promise.all(
    kiosList.map(async (k) => {
      let qr_image_url = null;
      if (k.qr_token) {
        qr_image_url = await renderQrImage(k.qr_token);
      }
      return {
        ...k,
        qr_image_url,
        is_basement: k.lantai === "BASEMENT",
      };
    }),
  );

  return kiosWithQrImages;
};

/**
 * Mengambil data satu kios berdasarkan ID atau kode_kios
 */
const getKiosById = async (id) => {
  const kios = await prisma.kios.findUnique({
    where: { id: Number(id) },
  });

  if (!kios) {
    throw new Error("Kios tidak ditemukan");
  }

  const qr_image_url = await renderQrImage(kios.qr_token);

  return {
    ...kios,
    qr_image_url,
    is_basement: kios.lantai === "BASEMENT",
  };
};

module.exports = {
  formatPayload,
  generateSignature,
  createQrToken,
  renderQrImage,
  generateKiosQr,
  verifyKiosQr,
  listAllKios,
  getKiosById,
};
