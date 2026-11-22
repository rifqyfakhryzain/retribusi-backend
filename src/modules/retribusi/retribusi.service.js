const prisma = require("../../config/prisma.js");
const { verifyKiosQr } = require("../qrcode/qrcode.service.js");
const { validateGeofence } = require("./retribusi.spatial.js");
const { DEFAULT_MAX_ACCURACY } = require("./retribusi.constant.js");

/**
 * Logika Transaksi Pelunasan Retribusi Lapak
 */
const bayarRetribusi = async ({
  userId,
  qr_token,
  latitude,
  longitude,
  accuracy,
}) => {
  // Verifikasi Kriptografi QR Code (Integritas HMAC-SHA256 & Cek DB)
  const kios = await verifyKiosQr(qr_token);

  // Filter Mutu Sinyal Satelit (Anti GPS Spoofing & Deviasi Parah)
  if (accuracy > DEFAULT_MAX_ACCURACY) {
    throw new Error(
      `Peringatan Sinyal: Akurasi GPS ponsel terlalu rendah (±${accuracy.toFixed(
        1,
      )}m > toleransi ${DEFAULT_MAX_ACCURACY}m). Silakan dekati area terbuka untuk memperkuat sinyal satelit!`,
    );
  }

  let isGeofenceValid = false;
  let isBasementBypass = false;
  let catatan = "";

  // Logika Bypass Khusus Kios Lantai Basement (Blindspot Satelit)
  if (kios.is_basement) {
    isGeofenceValid = true;
    isBasementBypass = true;
    catatan =
      "Bypass Geofence Otomatis: Kios berada di zona Basement (Blindspot Satelit)";
  } else {
    // Komputasi Algoritma Spasial (Ray Casting Point-in-Polygon)
    const geoResult = validateGeofence(latitude, longitude);

    if (!geoResult.isValid) {
      // Catat log transaksi yang ditolak untuk kebutuhan investigasi audit anti-fraud
      await prisma.transaksi_retribusi.create({
        data: {
          kios_id: kios.id,
          user_id: userId,
          nominal: kios.tarif,
          latitude,
          longitude,
          accuracy,
          is_geofence_valid: false,
          is_basement_bypass: false,
          status: "DITOLAK",
          catatan: geoResult.reason,
        },
      });

      throw new Error(geoResult.reason);
    }

    isGeofenceValid = true;
    isBasementBypass = false;
    catatan = geoResult.reason;
  }

  // Simpan Transaksi Sah ke Neon PostgreSQL
  const transaksi = await prisma.transaksi_retribusi.create({
    data: {
      kios_id: kios.id,
      user_id: userId,
      nominal: kios.tarif,
      latitude,
      longitude,
      accuracy,
      is_geofence_valid: isGeofenceValid,
      is_basement_bypass: isBasementBypass,
      status: "LUNAS",
      catatan,
    },
    include: {
      kios: true,
      petugas: {
        select: {
          id: true,
          nama: true,
          username: true,
        },
      },
    },
  });

  return {
    id: transaksi.id,
    kode_kios: kios.kode_kios,
    nama_pemilik: kios.nama_pemilik,
    jenis_dagangan: kios.jenis_dagangan,
    lantai: kios.lantai,
    nominal: transaksi.nominal,
    petugas: transaksi.petugas ? transaksi.petugas.nama : "Petugas",
    latitude: transaksi.latitude,
    longitude: transaksi.longitude,
    accuracy: transaksi.accuracy,
    is_geofence_valid: transaksi.is_geofence_valid,
    is_basement_bypass: transaksi.is_basement_bypass,
    status: transaksi.status,
    catatan: transaksi.catatan,
    created_at: transaksi.created_at,
  };
};

/**
 * Mengambil Riwayat Transaksi Penagihan Petugas Tertentu (Khusus Hari Ini Saja)
 */
const getRiwayatPetugas = async (userId) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const list = await prisma.transaksi_retribusi.findMany({
    where: {
      user_id: userId,
      status: "LUNAS",
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      created_at: "desc",
    },
    take: 100,
    include: {
      kios: true,
    },
  });

  return list.map((item) => ({
    id: item.id,
    kode_kios: item.kios.kode_kios,
    nama_pemilik: item.kios.nama_pemilik,
    jenis_dagangan: item.kios.jenis_dagangan,
    lantai: item.kios.lantai,
    nominal: item.nominal,
    latitude: item.latitude,
    longitude: item.longitude,
    accuracy: item.accuracy,
    is_geofence_valid: item.is_geofence_valid,
    is_basement_bypass: item.is_basement_bypass,
    status: item.status,
    catatan: item.catatan,
    created_at: item.created_at,
  }));
};

/**
 * Mengambil Seluruh Transaksi untuk Dasbor Monitoring Real-Time (Admin UPTD)
 * Mendukung filter tanggal spesifik (format YYYY-MM-DD) dan batas limit
 */
const getAllTransactions = async (param = {}) => {
  let limit = typeof param === "number" ? param : param?.limit;
  let tanggal = typeof param === "object" ? param?.tanggal : undefined;

  let whereClause = {};

  if (tanggal) {
    const [year, month, day] = tanggal.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    whereClause.created_at = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  const queryOptions = {
    where: whereClause,
    orderBy: {
      created_at: "desc",
    },
    include: {
      kios: true,
      petugas: {
        select: {
          id: true,
          nama: true,
          username: true,
        },
      },
    },
  };

  if (limit) {
    queryOptions.take = Number(limit);
  }

  const list = await prisma.transaksi_retribusi.findMany(queryOptions);

  return list.map((item) => ({
    id: item.id,
    kode_kios: item.kios.kode_kios,
    nama_pemilik: item.kios.nama_pemilik,
    jenis_dagangan: item.kios.jenis_dagangan,
    lantai: item.kios.lantai,
    nominal: item.nominal,
    petugas: item.petugas ? item.petugas.nama : "Petugas",
    latitude: item.latitude,
    longitude: item.longitude,
    accuracy: item.accuracy,
    is_geofence_valid: item.is_geofence_valid,
    is_basement_bypass: item.is_basement_bypass,
    status: item.status,
    catatan: item.catatan,
    created_at: item.created_at,
  }));
};

/**
 * Statistik Ringkasan Harian (Untuk Monitor & Dasbor)
 * Mendukung parameter tanggal spesifik (YYYY-MM-DD), default ke hari ini
 */
const getStatistikHariIni = async (tanggal) => {
  let startOfDay;
  let endOfDay;

  if (tanggal) {
    const [year, month, day] = tanggal.split("-").map(Number);
    startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  } else {
    startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  }

  const transaksiHariIni = await prisma.transaksi_retribusi.findMany({
    where: {
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      kios: true,
    },
  });

  const totalLunas = transaksiHariIni.filter((t) => t.status === "LUNAS");
  const totalNominal = totalLunas.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalFraudDitolak = transaksiHariIni.filter(
    (t) => t.status === "DITOLAK",
  ).length;

  const yyyy = startOfDay.getFullYear();
  const mm = String(startOfDay.getMonth() + 1).padStart(2, "0");
  const dd = String(startOfDay.getDate()).padStart(2, "0");

  return {
    total_transaksi_lunas: totalLunas.length,
    total_nominal_terkumpul: totalNominal,
    total_fraud_ditolak: totalFraudDitolak,
    tanggal: `${yyyy}-${mm}-${dd}`,
  };
};

module.exports = {
  bayarRetribusi,
  getRiwayatPetugas,
  getAllTransactions,
  getStatistikHariIni,
};
