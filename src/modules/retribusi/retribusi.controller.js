const retribusiService = require("./retribusi.service.js");

/**
 * Controller: Pembayaran Retribusi (Petugas Lapangan)
 * Dilengkapi Pemicu WebSocket (Socket.io) ke Dasbor Real-Time
 */
const bayarRetribusi = async (req, res) => {
  const io = req.app.get("io");

  try {
    const { qr_token, latitude, longitude, accuracy } = req.body;
    const userId = req.user.id;

    const result = await retribusiService.bayarRetribusi({
      userId,
      qr_token,
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracy: Number(accuracy),
    });

    // 🚀 Pancarkan sinyal WebSocket secara instan ke seluruh Dasbor Pimpinan yang sedang aktif
    if (io) {
      io.emit("transaksi_baru", {
        type: "TRANSAKSI_LUNAS",
        data: result,
        timestamp: new Date(),
      });
      console.log(`[Socket.io] Siaran transaksi_baru dipancarkan untuk kios: ${result.kode_kios}`);
    }

    return res.status(201).json({
      status: "success",
      message: `Pembayaran retribusi kios ${result.kode_kios} berhasil diverifikasi dan disetorkan!`,
      data: result,
    });
  } catch (error) {
    // ⚠️ Pancarkan peringatan fraud jika terjadi penolakan geofence / sinyal satelit
    if (io) {
      io.emit("fraud_terdeteksi", {
        type: "FRAUD_REJECTED",
        message: error.message,
        timestamp: new Date(),
      });
      console.warn(`[Socket.io] Siaran fraud_terdeteksi dipancarkan: ${error.message}`);
    }

    return res.status(400).json({
      status: "error",
      message: error.message || "Gagal memproses pembayaran retribusi",
    });
  }
};

/**
 * Controller: Riwayat Transaksi Sesi Petugas
 */
const getRiwayatPetugas = async (req, res) => {
  try {
    const userId = req.user.id;
    const riwayat = await retribusiService.getRiwayatPetugas(userId);

    return res.status(200).json({
      status: "success",
      message: "Riwayat transaksi berhasil diambil",
      data: riwayat,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Gagal mengambil riwayat transaksi",
    });
  }
};

/**
 * Controller: Seluruh Log Transaksi untuk Dasbor Monitoring Admin UPTD
 */
const getAllTransactions = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    const list = await retribusiService.getAllTransactions();

    return res.status(200).json({
      status: "success",
      message: "Seluruh log transaksi berhasil diambil",
      data: list,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Gagal mengambil seluruh transaksi",
    });
  }
};

/**
 * Controller: Ringkasan Statistik Transaksi
 */
const getStatistikHariIni = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    const statistik = await retribusiService.getStatistikHariIni();

    return res.status(200).json({
      status: "success",
      message: "Statistik harian berhasil diambil",
      data: statistik,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Gagal mengambil statistik harian",
    });
  }
};

module.exports = {
  bayarRetribusi,
  getRiwayatPetugas,
  getAllTransactions,
  getStatistikHariIni,
};
